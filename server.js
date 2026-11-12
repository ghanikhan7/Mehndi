const http = require('http');
const fs = require('fs');
const path = require('path');
const apiHandler = require('./api/index');

const PORT = Number(process.env.PORT) || 8080;
const ROOT_DIR = __dirname;

// Static literal fs.statSync calls so Vercel's Node File Tracer (@vercel/nft)
// statically detects and bundles every website and CMS file into /var/task.
try {
  fs.statSync(path.join(__dirname, 'index.html'));
  fs.statSync(path.join(__dirname, 'images', 'logo.png'));
  fs.statSync(path.join(__dirname, 'images', 'hero-mehndi.webp'));
  fs.statSync(path.join(__dirname, 'images', 'alfiya-work-1.webp'));
  fs.statSync(path.join(__dirname, 'images', 'alfiya-work-2.webp'));
  fs.statSync(path.join(__dirname, 'images', 'alfiya-work-3.webp'));
  fs.statSync(path.join(__dirname, 'images', 'alfiya-work-4.webp'));
  fs.statSync(path.join(__dirname, 'images', 'alfiya-work-5.webp'));
  fs.statSync(path.join(__dirname, 'lib', 'views', 'login.html'));
  fs.statSync(path.join(__dirname, 'lib', 'views', 'admin.html'));
  fs.statSync(path.join(__dirname, 'data', 'cms-db.json'));
} catch (_) {
  // Ignore at build time
}

const BUNDLED_ASSETS = {
  '/': path.join(__dirname, 'index.html'),
  '/index.html': path.join(__dirname, 'index.html'),
  '/images/logo.png': path.join(__dirname, 'images', 'logo.png'),
  '/images/hero-mehndi.webp': path.join(__dirname, 'images', 'hero-mehndi.webp'),
  '/images/alfiya-work-1.webp': path.join(__dirname, 'images', 'alfiya-work-1.webp'),
  '/images/alfiya-work-2.webp': path.join(__dirname, 'images', 'alfiya-work-2.webp'),
  '/images/alfiya-work-3.webp': path.join(__dirname, 'images', 'alfiya-work-3.webp'),
  '/images/alfiya-work-4.webp': path.join(__dirname, 'images', 'alfiya-work-4.webp'),
  '/images/alfiya-work-5.webp': path.join(__dirname, 'images', 'alfiya-work-5.webp')
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const rawPathname = decodeURIComponent(parsedUrl.pathname);
  const pathname = rawPathname.replace(/\/+$/, '') || '/';

  // 1. Delegate API routes, /admin, /admin/login, and /uploads/* to unified API handler
  if (
    pathname.startsWith('/api/') ||
    pathname === '/admin' ||
    pathname === '/admin/login' ||
    pathname.startsWith('/uploads/')
  ) {
    return apiHandler(req, res);
  }

  // 2. Serve bundled homepage & images directly
  if (BUNDLED_ASSETS[pathname]) {
    const assetPath = BUNDLED_ASSETS[pathname];
    if (fs.existsSync(assetPath)) {
      const ext = path.extname(assetPath).toLowerCase();
      const buf = fs.readFileSync(assetPath);
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Content-Length': buf.length,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
      });
      return res.end(buf);
    }
  }

  // 3. Block direct access to sensitive internal directories or dot-files
  if (
    pathname.startsWith('/data') ||
    pathname.startsWith('/lib') ||
    pathname.startsWith('/supabase') ||
    pathname.startsWith('/admin/') ||
    pathname.includes('..') ||
    path.basename(pathname).startsWith('.')
  ) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Forbidden');
  }

  // 4. Fallback for any other static files in ROOT_DIR
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.join(ROOT_DIR, relativePath);

  if (!filePath.startsWith(ROOT_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Not Found');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const buf = fs.readFileSync(filePath);
  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': buf.length,
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
  });
  return res.end(buf);
});

server.listen(PORT, () => {
  console.log(`Alfiya Tamboli Website & Mini CMS running at http://localhost:${PORT}`);
  console.log(`- Public Website: http://localhost:${PORT}/`);
  console.log(`- Admin Login:    http://localhost:${PORT}/admin/login`);
  console.log(`- Admin Panel:    http://localhost:${PORT}/admin`);
});
