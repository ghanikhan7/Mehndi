const fs = require('fs');
const path = require('path');
const {
  verifyCredentials,
  checkRateLimit,
  recordFailedLogin,
  clearFailedLogin,
  createSessionToken,
  getAuthenticatedAdmin,
  buildSessionCookieHeader,
  buildClearCookieHeader,
  sanitizeText
} = require('../lib/auth');
const db = require('../lib/db');

function sendJson(res, status, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders
  });
  res.end(body);
}

function sendHtmlFile(res, filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    });
    res.end(content);
  } catch (_) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Page not found');
  }
}

function redirect(res, location) {
  res.writeHead(302, { Location: location, 'Cache-Control': 'no-store' });
  res.end();
}

function readJsonBody(req, maxBytes = 8 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    let total = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (_) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname.replace(/\/+$/, '') || '/';
  const method = req.method.toUpperCase();

  try {
    // ========================================================================
    // 1. Admin HTML Page Routes (/admin and /admin/login)
    // ========================================================================
    if (pathname === '/admin/login' && method === 'GET') {
      const admin = getAuthenticatedAdmin(req);
      if (admin) {
        return redirect(res, '/admin');
      }
      return sendHtmlFile(res, path.join(process.cwd(), 'admin', 'login.html'));
    }

    if (pathname === '/admin' && method === 'GET') {
      const admin = getAuthenticatedAdmin(req);
      if (!admin) {
        return redirect(res, '/admin/login');
      }
      return sendHtmlFile(res, path.join(process.cwd(), 'admin', 'index.html'));
    }

    // ========================================================================
    // 2. Serve Local Uploaded Images (/uploads/*)
    // ========================================================================
    if (pathname.startsWith('/uploads/') && method === 'GET') {
      const safeName = path.basename(pathname);
      const filePath = path.join(db.UPLOADS_DIR, safeName);
      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('Image not found');
      }
      const ext = path.extname(safeName).toLowerCase();
      const mimeMap = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp'
      };
      const stream = fs.createReadStream(filePath);
      res.writeHead(200, {
        'Content-Type': mimeMap[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable'
      });
      return stream.pipe(res);
    }

    // ========================================================================
    // 3. Public Website API Routes
    // ========================================================================
    if (pathname === '/api/public/content' && method === 'GET') {
      const data = await db.getAllData();
      const enabledCategories = data.categories
        .filter((c) => c.enabled !== false)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      const sortedGallery = [...data.gallery].sort(
        (a, b) => (a.display_order || 0) - (b.display_order || 0)
      );
      const enabledServices = data.services
        .filter((s) => s.enabled !== false)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

      return sendJson(res, 200, {
        settings: data.settings,
        categories: enabledCategories,
        gallery: sortedGallery,
        services: enabledServices
      });
    }

    if (pathname === '/api/public/enquiries' && method === 'POST') {
      const body = await readJsonBody(req);
      const customer_name = sanitizeText(body.customer_name || body.name, 120);
      const phone = sanitizeText(body.phone, 40);
      const event_date = sanitizeText(body.event_date || body.date, 40);
      const service = sanitizeText(body.service, 140);
      const location = sanitizeText(body.location, 180);
      const message = sanitizeText(body.message || body.notes, 1000);

      if (!customer_name || !phone || !event_date || !service || !location) {
        return sendJson(res, 400, {
          error: 'Please fill in your name, phone number, event date, service category and location.'
        });
      }

      const saved = await db.addEnquiry({
        customer_name,
        phone,
        event_date,
        service,
        location,
        message
      });

      return sendJson(res, 201, {
        success: true,
        enquiry: saved
      });
    }

    // ========================================================================
    // 4. Authentication API Routes (/api/auth/*)
    // ========================================================================
    if (pathname === '/api/auth/login' && method === 'POST') {
      const rate = checkRateLimit(req);
      if (!rate.allowed) {
        return sendJson(res, 429, {
          error: `Too many failed login attempts. Please wait ${rate.retryAfterSec} seconds before trying again.`
        });
      }

      const body = await readJsonBody(req);
      const username = sanitizeText(body.username, 80);
      const password = String(body.password || '');

      if (!verifyCredentials(username, password)) {
        recordFailedLogin(req);
        return sendJson(res, 401, {
          error: 'Invalid username or password. Please check your credentials and try again.'
        });
      }

      clearFailedLogin(req);
      const isSecure =
        req.headers['x-forwarded-proto'] === 'https' || Boolean(req.connection && req.connection.encrypted);
      const token = createSessionToken(username);
      const cookieHeader = buildSessionCookieHeader(token, isSecure);

      return sendJson(
        res,
        200,
        {
          success: true,
          user: { username }
        },
        { 'Set-Cookie': cookieHeader }
      );
    }

    if (pathname === '/api/auth/logout' && method === 'POST') {
      return sendJson(
        res,
        200,
        { success: true },
        { 'Set-Cookie': buildClearCookieHeader() }
      );
    }

    if (pathname === '/api/auth/session' && method === 'GET') {
      const admin = getAuthenticatedAdmin(req);
      if (!admin) {
        return sendJson(res, 401, { authenticated: false });
      }
      return sendJson(res, 200, {
        authenticated: true,
        user: { username: admin.sub }
      });
    }

    // ========================================================================
    // 5. Protected Admin API Routes (/api/admin/*)
    // ========================================================================
    if (pathname.startsWith('/api/admin')) {
      const admin = getAuthenticatedAdmin(req);
      if (!admin) {
        return sendJson(res, 401, {
          error: 'Unauthorized. Please log in at /admin/login.'
        });
      }

      // GET /api/admin/bootstrap
      if (pathname === '/api/admin/bootstrap' && method === 'GET') {
        const data = await db.getAllData();
        const stats = {
          totalCategories: data.categories.length,
          activeCategories: data.categories.filter((c) => c.enabled !== false).length,
          totalGalleryImages: data.gallery.length,
          featuredGalleryImages: data.gallery.filter((g) => g.featured).length,
          totalServices: data.services.length,
          activeServices: data.services.filter((s) => s.enabled !== false).length,
          totalEnquiries: data.enquiries.length,
          newEnquiries: data.enquiries.filter((e) => e.status === 'New').length
        };
        return sendJson(res, 200, {
          user: { username: admin.sub },
          storageMode: data.storageMode,
          stats,
          ...data
        });
      }

      // POST /api/admin/upload (Multipart/Base64 secure image upload)
      if (pathname === '/api/admin/upload' && method === 'POST') {
        const body = await readJsonBody(req, 10 * 1024 * 1024);
        if (!body.base64Data || !body.mimeType) {
          return sendJson(res, 400, { error: 'Missing image data or MIME type.' });
        }
        const stored = await db.storeUploadedImage({
          base64Data: body.base64Data,
          mimeType: body.mimeType,
          originalName: body.originalName || 'upload'
        });
        return sendJson(res, 201, { success: true, ...stored });
      }

      // --- Categories CRUD ---
      if (pathname === '/api/admin/categories' && method === 'POST') {
        const body = await readJsonBody(req);
        const name = sanitizeText(body.name, 120);
        const description = sanitizeText(body.description, 600);
        if (!name || !description) {
          return sendJson(res, 400, { error: 'Category name and description are required.' });
        }
        const images = Array.isArray(body.images)
          ? body.images
              .filter((img) => img && img.url)
              .map((img) => ({
                url: sanitizeText(img.url, 500),
                source_url: sanitizeText(img.source_url || img.url, 500),
                caption: sanitizeText(img.caption || name, 120),
                alt: sanitizeText(img.alt || `${name} reference: ${img.caption || 'Mehndi design'}`, 220)
              }))
          : [];

        const created = await db.addCategory({
          name,
          description,
          badge: sanitizeText(body.badge || 'Inspiration Ref', 50),
          foot_note: sanitizeText(body.foot_note || 'Hands & feet', 80),
          display_order: body.display_order,
          enabled: body.enabled !== false,
          images
        });
        return sendJson(res, 201, { success: true, category: created });
      }

      if (pathname.startsWith('/api/admin/categories/')) {
        const id = decodeURIComponent(pathname.slice('/api/admin/categories/'.length));
        if (method === 'PUT') {
          const body = await readJsonBody(req);
          const updates = {};
          if (body.name !== undefined) {
            const cleanName = sanitizeText(body.name, 120);
            if (!cleanName) return sendJson(res, 400, { error: 'Category name cannot be empty.' });
            updates.name = cleanName;
          }
          if (body.description !== undefined) {
            const cleanDesc = sanitizeText(body.description, 600);
            if (!cleanDesc)
              return sendJson(res, 400, { error: 'Category description cannot be empty.' });
            updates.description = cleanDesc;
          }
          if (body.badge !== undefined) updates.badge = sanitizeText(body.badge, 50);
          if (body.foot_note !== undefined) updates.foot_note = sanitizeText(body.foot_note, 80);
          if (body.display_order !== undefined) updates.display_order = Number(body.display_order);
          if (body.enabled !== undefined) updates.enabled = Boolean(body.enabled);
          if (Array.isArray(body.images)) {
            updates.images = body.images
              .filter((img) => img && img.url)
              .map((img) => ({
                url: sanitizeText(img.url, 500),
                source_url: sanitizeText(img.source_url || img.url, 500),
                caption: sanitizeText(img.caption || 'Mehndi design', 120),
                alt: sanitizeText(img.alt || img.caption || 'Mehndi design reference', 220)
              }));
          }

          const updated = await db.updateCategory(id, updates);
          if (!updated) return sendJson(res, 404, { error: 'Category not found.' });
          return sendJson(res, 200, { success: true, category: updated });
        }

        if (method === 'DELETE') {
          const deleted = await db.deleteCategory(id);
          if (!deleted) return sendJson(res, 404, { error: 'Category not found.' });
          return sendJson(res, 200, { success: true });
        }
      }

      // --- Gallery CRUD ---
      if (pathname === '/api/admin/gallery' && method === 'POST') {
        const body = await readJsonBody(req);
        const rawItems = Array.isArray(body.items) ? body.items : [body];
        const cleanItems = rawItems
          .filter((item) => item && item.image_url)
          .map((item) => ({
            title: sanitizeText(item.title || 'Mehendi Design', 120),
            description: sanitizeText(
              item.description || item.title || 'Mehendi design by Alfiya Tamboli',
              300
            ),
            category_name: sanitizeText(item.category_name || 'Bridal Mehndi', 120),
            image_url: sanitizeText(item.image_url, 500),
            display_order: item.display_order,
            featured: item.featured !== false
          }));

        if (cleanItems.length === 0) {
          return sendJson(res, 400, { error: 'At least one valid gallery image is required.' });
        }

        const created = await db.addGalleryImages(cleanItems);
        return sendJson(res, 201, { success: true, images: created });
      }

      if (pathname.startsWith('/api/admin/gallery/')) {
        const id = decodeURIComponent(pathname.slice('/api/admin/gallery/'.length));
        if (method === 'PUT') {
          const body = await readJsonBody(req);
          const updates = {};
          if (body.title !== undefined) updates.title = sanitizeText(body.title, 120);
          if (body.description !== undefined)
            updates.description = sanitizeText(body.description, 300);
          if (body.category_name !== undefined)
            updates.category_name = sanitizeText(body.category_name, 120);
          if (body.image_url !== undefined) updates.image_url = sanitizeText(body.image_url, 500);
          if (body.display_order !== undefined) updates.display_order = Number(body.display_order);
          if (body.featured !== undefined) updates.featured = Boolean(body.featured);

          const updated = await db.updateGalleryImage(id, updates);
          if (!updated) return sendJson(res, 404, { error: 'Gallery image not found.' });
          return sendJson(res, 200, { success: true, image: updated });
        }

        if (method === 'DELETE') {
          const deleted = await db.deleteGalleryImage(id);
          if (!deleted) return sendJson(res, 404, { error: 'Gallery image not found.' });
          return sendJson(res, 200, { success: true });
        }
      }

      // --- Services & Pricing CRUD ---
      if (pathname === '/api/admin/services' && method === 'POST') {
        const body = await readJsonBody(req);
        const name = sanitizeText(body.name, 140);
        const description = sanitizeText(body.description, 500);
        const starting_price = sanitizeText(body.starting_price, 120);
        if (!name || !description || !starting_price) {
          return sendJson(res, 400, {
            error: 'Service name, description and starting price are required.'
          });
        }
        const created = await db.addService({
          name,
          description,
          starting_price,
          is_demo_price: body.is_demo_price !== false,
          display_order: body.display_order,
          enabled: body.enabled !== false
        });
        return sendJson(res, 201, { success: true, service: created });
      }

      if (pathname.startsWith('/api/admin/services/')) {
        const id = decodeURIComponent(pathname.slice('/api/admin/services/'.length));
        if (method === 'PUT') {
          const body = await readJsonBody(req);
          const updates = {};
          if (body.name !== undefined) updates.name = sanitizeText(body.name, 140);
          if (body.description !== undefined)
            updates.description = sanitizeText(body.description, 500);
          if (body.starting_price !== undefined)
            updates.starting_price = sanitizeText(body.starting_price, 120);
          if (body.is_demo_price !== undefined)
            updates.is_demo_price = Boolean(body.is_demo_price);
          if (body.display_order !== undefined) updates.display_order = Number(body.display_order);
          if (body.enabled !== undefined) updates.enabled = Boolean(body.enabled);

          const updated = await db.updateService(id, updates);
          if (!updated) return sendJson(res, 404, { error: 'Service not found.' });
          return sendJson(res, 200, { success: true, service: updated });
        }

        if (method === 'DELETE') {
          const deleted = await db.deleteService(id);
          if (!deleted) return sendJson(res, 404, { error: 'Service not found.' });
          return sendJson(res, 200, { success: true });
        }
      }

      // --- Booking Enquiries Management ---
      if (pathname.startsWith('/api/admin/enquiries/')) {
        const id = decodeURIComponent(pathname.slice('/api/admin/enquiries/'.length));
        if (method === 'PUT') {
          const body = await readJsonBody(req);
          const status = sanitizeText(body.status, 40);
          const updated = await db.updateEnquiryStatus(id, status);
          if (!updated) return sendJson(res, 404, { error: 'Enquiry not found.' });
          return sendJson(res, 200, { success: true, enquiry: updated });
        }

        if (method === 'DELETE') {
          const deleted = await db.deleteEnquiry(id);
          if (!deleted) return sendJson(res, 404, { error: 'Enquiry not found.' });
          return sendJson(res, 200, { success: true });
        }
      }

      // --- Website Settings ---
      if (pathname === '/api/admin/settings' && method === 'PUT') {
        const body = await readJsonBody(req);
        if (!body.artist_name || !body.whatsapp_number) {
          return sendJson(res, 400, {
            error: 'Artist name and WhatsApp number are required.'
          });
        }
        const updated = await db.updateSettings(body);
        return sendJson(res, 200, { success: true, settings: updated });
      }

      return sendJson(res, 404, { error: 'Admin API endpoint not found.' });
    }

    return sendJson(res, 404, { error: 'API endpoint not found.' });
  } catch (err) {
    return sendJson(res, 500, {
      error: err.message || 'Internal server error'
    });
  }
};

