const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load local .env if present (without requiring external dotenv dependency)
function loadEnvFile() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch (_) {
    // Ignore .env read errors in serverless environments
  }
}

loadEnvFile();

// Default development demo credentials (hash of "Alfiya@Demo2026" with salt below)
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_SALT = '7f4e9a1b2c3d4e5f6a7b8c9d0e1f2a3b';
const DEFAULT_HASH =
  '1682df777d57ad770887b6b111a5b425c06987870ae489d177bb5f7f341793782cf98874f362cc83eb83a773988b21bc9db42ed42c15c1e29ac97494f134856e';

const SESSION_COOKIE_NAME = 'alfiya_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

// In-memory login rate limiter (per IP)
const loginAttempts = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 6;

function getSessionSecret() {
  return (
    process.env.SESSION_SECRET ||
    'alfiya-cms-session-secret-key-change-in-production-2026'
  );
}

function hashPassword(password, salt) {
  return crypto.scryptSync(String(password), String(salt), 64).toString('hex');
}

function verifyCredentials(username, password) {
  const expectedUser = (process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME).trim();
  const salt = (process.env.ADMIN_PASSWORD_SALT || DEFAULT_SALT).trim();
  const expectedHash = (process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH).trim();

  if (!username || !password) return false;
  if (String(username).trim() !== expectedUser) return false;

  try {
    const computedHex = hashPassword(password, salt);
    const a = Buffer.from(computedHex, 'hex');
    const b = Buffer.from(expectedHash, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (_) {
    return false;
  }
}

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim();
  }
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function checkRateLimit(req) {
  const ip = getClientIp(req);
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry) return { allowed: true, remaining: RATE_LIMIT_MAX_ATTEMPTS };
  if (now - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.delete(ip);
    return { allowed: true, remaining: RATE_LIMIT_MAX_ATTEMPTS };
  }
  if (entry.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    const retryAfterSec = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - entry.firstAttemptAt)) / 1000);
    return { allowed: false, retryAfterSec };
  }
  return { allowed: true, remaining: RATE_LIMIT_MAX_ATTEMPTS - entry.count };
}

function recordFailedLogin(req) {
  const ip = getClientIp(req);
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttemptAt: now });
  } else {
    entry.count += 1;
  }
}

function clearFailedLogin(req) {
  const ip = getClientIp(req);
  loginAttempts.delete(ip);
}

function createSessionToken(username) {
  const payload = {
    sub: username,
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_MS,
    nonce: crypto.randomBytes(8).toString('hex')
  };
  const base64Payload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(base64Payload)
    .digest('base64url');
  return `${base64Payload}.${signature}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [base64Payload, signature] = token.split('.');
  if (!base64Payload || !signature) return null;

  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(base64Payload)
    .digest('base64url');

  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch (_) {
    return null;
  }
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      out[k] = decodeURIComponent(v);
    }
  });
  return out;
}

function getAuthenticatedAdmin(req) {
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE_NAME];
  return verifySessionToken(token);
}

function buildSessionCookieHeader(token, isSecure) {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  const secureFlag = isSecure ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secureFlag}`;
}

function buildClearCookieHeader() {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function sanitizeText(str, maxLen = 500) {
  if (str === null || str === undefined) return '';
  return String(str).trim().slice(0, maxLen);
}

module.exports = {
  verifyCredentials,
  checkRateLimit,
  recordFailedLogin,
  clearFailedLogin,
  createSessionToken,
  getAuthenticatedAdmin,
  buildSessionCookieHeader,
  buildClearCookieHeader,
  sanitizeText
};

