const http = require('http');
const fs = require('fs');
const path = require('path');
const apiHandler = require('./api/index');

const PORT = Number(process.env.PORT) || 8080;
const ROOT_DIR = process.cwd();

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
  const pathname = parsedUrl.pathname.replace(/\/+$/, '') || '/';

  // Delegate API routes, /admin, /admin/login, and /uploads/* to unified API handler
  if (
    pathname.startsWith('/api/') ||
    pathname === '/admin' ||
    pathname === '/admin/login' ||
    pathname.startsWith('/uploads/')
  ) {
    return apiHandler(req, res);
  }

  // Block direct access to sensitive server files or raw admin HTML bypassing auth check
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

  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.join(ROOT_DIR, relativePath);

  if (!filePath.startsWith(ROOT_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Not Found');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Alfiya Tamboli Website & Mini CMS running at http://localhost:${PORT}`);
  console.log(`- Public Website: http://localhost:${PORT}/`);
  console.log(`- Admin Login:    http://localhost:${PORT}/admin/login`);
  console.log(`- Admin Panel:    http://localhost:${PORT}/admin`);
});

