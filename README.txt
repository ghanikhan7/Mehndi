ALFIYA TAMBOLI – THE MEHENDI ARTIST (AURANGABAD, MAHARASHTRA)
Production Website + Mini CMS (AlisTech)

LIVE LOCAL ROUTES:
- Public Website: http://localhost:8080/
- Admin Login:    http://localhost:8080/admin/login
- Admin Panel:    http://localhost:8080/admin

ADMIN AUTHENTICATION:
- Configure ADMIN_USERNAME, ADMIN_PASSWORD_SALT, ADMIN_PASSWORD_HASH, and SESSION_SECRET via environment variables in Vercel (see .env.example).

HOW TO RUN LOCALLY:
1. Run `npm start` (or `node scripts/dev-server.js`).
2. Open `http://localhost:8080` in your browser.
3. Visit `http://localhost:8080/admin/login` to manage categories, gallery, services & pricing, booking enquiries, and website settings.

HOW TO DEPLOY (GITHUB + SUPABASE + VERCEL):
1. Run `supabase/schema.sql` in your Supabase SQL Editor to create the tables (`site_settings`, `categories`, `gallery_images`, `services`, `enquiries`) and public storage bucket (`alfiya-media`).
2. Push this project to GitHub (never commit `.env`).
3. Import into Vercel and configure the environment variables from `.env.example` (`ADMIN_USERNAME`, `ADMIN_PASSWORD_SALT`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`).
