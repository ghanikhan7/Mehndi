const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'cms-db.json');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

function getInitialSeedData() {
  return {
    settings: {
      id: 'main',
      artist_name: 'Alfiya Tamboli',
      tagline: 'The Mehendi Artist',
      whatsapp_number: '917057703257',
      whatsapp_display: '+91 70577 03257',
      instagram_url: 'https://www.instagram.com/aurangabad_mehendi_by_alfiya/',
      instagram_handle: '@aurangabad_mehendi_by_alfiya',
      location: 'Aurangabad, Maharashtra',
      topline_text: 'Bridal · Party · Festive Mehendi   |   Aurangabad & Surrounding Areas',
      hero_kicker: 'Artistry for your once-in-a-lifetime moments',
      hero_subtitle:
        'Intricate bridal, Arabic and festive mehendi, thoughtfully designed for your special moments. Alfiya brings detail, elegance and a personal touch to every design across Aurangabad.',
      experience_years: '5+',
      about_heading: 'Alfiya Tamboli',
      about_paragraph_1:
        'Bridal and party mehendi artist based in Aurangabad, Maharashtra. With a passion for fine detailing and traditional artistry, Alfiya creates bespoke henna designs that complement your celebration and personal style.',
      about_paragraph_2:
        'Whether you have a favourite inspiration reference or want a custom design crafted around your bridal outfit and occasion, let’s plan something beautiful together.',
      contact_note: 'Citywide availability in Aurangabad · Enquire for outstation travel',
      updated_at: new Date().toISOString()
    },
    categories: [
      {
        id: 'cat-1-traditional-indian',
        name: 'Traditional Indian Mehndi',
        description:
          'Dense, intricate coverage with paisleys, peacocks, lotus flowers and mandalas. A timeless choice for weddings and traditional celebrations.',
        badge: 'Inspiration Ref',
        foot_note: 'Hands & feet',
        display_order: 1,
        enabled: true,
        images: [
          {
            url: 'https://images.pexels.com/photos/12584801/pexels-photo-12584801.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/12584801/',
            caption: 'Traditional hands & feet',
            alt: 'Traditional Indian Mehndi inspiration reference showing full bridal henna on hands and feet'
          },
          {
            url: 'https://images.pexels.com/photos/27151466/pexels-photo-27151466.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/27151466/',
            caption: 'Intricate hand & forearm',
            alt: 'Traditional Indian Mehndi inspiration reference with intricate palm and forearm motifs'
          },
          {
            url: 'https://images.pexels.com/photos/8232400/pexels-photo-8232400.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/8232400/',
            caption: 'Traditional foot mehndi',
            alt: 'Traditional Indian Mehndi inspiration reference featuring classical bridal foot mehndi'
          }
        ]
      },
      {
        id: 'cat-2-arabic',
        name: 'Arabic Mehndi',
        description:
          'Bold floral trails, flowing leaves and open negative space for a graceful, striking finish that highlights every curve of the hand.',
        badge: 'Inspiration Ref',
        foot_note: 'Floral & flowing',
        display_order: 2,
        enabled: true,
        images: [
          {
            url: 'https://images.pexels.com/photos/2064505/pexels-photo-2064505.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/2064505/',
            caption: 'Arabic floral trail',
            alt: 'Arabic Mehndi inspiration reference showing a diagonal floral trail on the hand'
          },
          {
            url: 'https://images.pexels.com/photos/12872534/pexels-photo-12872534.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/12872534/',
            caption: 'Flowing hand pattern',
            alt: 'Arabic Mehndi inspiration reference with flowing leafy pattern and open space'
          },
          {
            url: 'https://images.pexels.com/photos/33452609/pexels-photo-33452609.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/33452609/',
            caption: 'Detailed floral palm',
            alt: 'Arabic Mehndi inspiration reference featuring bold shaded floral palm artwork'
          }
        ]
      },
      {
        id: 'cat-3-pakistani',
        name: 'Pakistani Mehndi',
        description:
          'A rich blend of fine Indian detail, bold outlines, architectural domes, floral panels and delicate net-like jaal patterns.',
        badge: 'Inspiration Ref',
        foot_note: 'Jaal & floral panels',
        display_order: 3,
        enabled: true,
        images: [
          {
            url: 'https://images.pexels.com/photos/27164128/pexels-photo-27164128.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/27164128/',
            caption: 'Pakistani wedding hands',
            alt: 'Pakistani Mehndi inspiration reference showing ornate wedding henna on hands'
          },
          {
            url: 'https://images.pexels.com/photos/15460659/pexels-photo-15460659.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/15460659/',
            caption: 'Detailed bridal palm',
            alt: 'Pakistani Mehndi inspiration reference with detailed jaal and mandala palm work'
          },
          {
            url: 'https://images.pexels.com/photos/40347701/pexels-photo-40347701.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/40347701/',
            caption: 'Traditional bridal detail',
            alt: 'Pakistani Mehndi inspiration reference highlighting fine bridal cuffs and finger details'
          }
        ]
      },
      {
        id: 'cat-4-indo-arabic',
        name: 'Indo-Arabic Mehndi',
        description:
          'A balanced fusion of intricate Indian inner fillings and bold flowing Arabic outlines, ideal for engagements, sangeet and festive occasions.',
        badge: 'Inspiration Ref',
        foot_note: 'Fusion artistry',
        display_order: 4,
        enabled: true,
        images: [
          {
            url: 'https://images.pexels.com/photos/12872533/pexels-photo-12872533.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/12872533/',
            caption: 'Fine detailed hand',
            alt: 'Indo-Arabic Mehndi inspiration reference with fine detailed hand patterns'
          },
          {
            url: 'https://images.pexels.com/photos/17343893/pexels-photo-17343893.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/17343893/',
            caption: 'Floral & ornamental',
            alt: 'Indo-Arabic Mehndi inspiration reference combining floral outlines and ornamental fills'
          },
          {
            url: 'https://images.pexels.com/photos/31469724/pexels-photo-31469724.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/31469724/',
            caption: 'Henna with jewellery',
            alt: 'Indo-Arabic Mehndi inspiration reference styled with festive bridal jewellery'
          }
        ]
      },
      {
        id: 'cat-5-moroccan',
        name: 'Moroccan Mehndi',
        description:
          'Geometric, symmetrical motifs featuring diamonds, chevrons, linework and clean graphic shapes for a contemporary, distinctive look.',
        badge: 'Inspiration Ref',
        foot_note: 'Hands & feet',
        display_order: 5,
        enabled: true,
        images: [
          {
            url: 'https://images.pexels.com/photos/8256074/pexels-photo-8256074.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/8256074/',
            caption: 'Geometric henna',
            alt: 'Moroccan Mehndi inspiration reference with geometric diamond henna patterns'
          },
          {
            url: 'https://images.pexels.com/photos/20838876/pexels-photo-20838876.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/20838876/',
            caption: 'Patterned hand design',
            alt: 'Moroccan Mehndi inspiration reference showing symmetrical patterned hand design'
          },
          {
            url: 'https://images.pexels.com/photos/18016524/pexels-photo-18016524.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/18016524/',
            caption: 'Henna on arm & feet',
            alt: 'Moroccan Mehndi inspiration reference featuring coordinated henna on arm and feet'
          }
        ]
      },
      {
        id: 'cat-6-bridal',
        name: 'Bridal Mehndi',
        description:
          'Elaborate wedding designs for hands, arms and feet, with room for personalised couple motifs, initials and royal storytelling.',
        badge: 'Inspiration Ref',
        foot_note: 'Hands & feet',
        display_order: 6,
        enabled: true,
        images: [
          {
            url: 'https://images.pexels.com/photos/30868062/pexels-photo-30868062.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/30868062/',
            caption: 'Bridal hands & feet',
            alt: 'Bridal Mehndi inspiration reference showing full bridal hands and feet coverage'
          },
          {
            url: 'https://images.pexels.com/photos/11484582/pexels-photo-11484582.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/11484582/',
            caption: 'Bridal feet detail',
            alt: 'Bridal Mehndi inspiration reference highlighting intricate bridal feet detail'
          },
          {
            url: 'https://images.pexels.com/photos/38712961/pexels-photo-38712961.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/38712961/',
            caption: 'Bridal feet & anklets',
            alt: 'Bridal Mehndi inspiration reference featuring bridal feet henna with gold anklets'
          }
        ]
      },
      {
        id: 'cat-7-minimalist',
        name: 'Minimalist & Jewellery Mehndi',
        description:
          'Light, delicate motifs inspired by hathphool rings, bracelets, wrist cuffs and fine floral accents for modern celebrations.',
        badge: 'Inspiration Ref',
        foot_note: 'Hands & feet',
        display_order: 7,
        enabled: true,
        images: [
          {
            url: 'https://images.pexels.com/photos/5166595/pexels-photo-5166595.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/5166595/',
            caption: 'Fine hand detail',
            alt: 'Minimalist and Jewellery Mehndi inspiration reference with fine back-hand detail'
          },
          {
            url: 'https://images.pexels.com/photos/5166596/pexels-photo-5166596.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/5166596/',
            caption: 'Minimal hand pattern',
            alt: 'Minimalist and Jewellery Mehndi inspiration reference showing minimal jewellery-style hand pattern'
          },
          {
            url: 'https://images.pexels.com/photos/21568655/pexels-photo-21568655.jpeg?auto=compress&cs=tinysrgb&w=600',
            source_url: 'https://www.pexels.com/photo/21568655/',
            caption: 'Delicate feet design',
            alt: 'Minimalist and Jewellery Mehndi inspiration reference featuring delicate anklet-style feet design'
          }
        ]
      }
    ],
    gallery: [
      {
        id: 'gal-1',
        title: 'Bridal Palms',
        description: 'Intricate bridal mehendi on both palms with floral and net motifs',
        category_name: 'Bridal Mehndi',
        image_url: 'images/alfiya-work-1.webp',
        display_order: 1,
        featured: true,
        created_at: '2026-11-01T10:00:00.000Z'
      },
      {
        id: 'gal-2',
        title: 'Back-Hand Floral Trail',
        description: 'Detailed back-hand mehendi with floral wrist mandala and leafy finger trails',
        category_name: 'Arabic Mehndi',
        image_url: 'images/alfiya-work-2.webp',
        display_order: 2,
        featured: true,
        created_at: '2026-11-01T10:01:00.000Z'
      },
      {
        id: 'gal-3',
        title: 'Traditional Feet Design',
        description: 'Intricate floral and leafy mehendi design on both feet',
        category_name: 'Traditional Indian Mehndi',
        image_url: 'images/alfiya-work-3.webp',
        display_order: 3,
        featured: true,
        created_at: '2026-11-01T10:02:00.000Z'
      },
      {
        id: 'gal-4',
        title: 'Crossed Hands & Forearms',
        description: 'Coordinated Arabic and floral henna designs on crossed hands and forearms',
        category_name: 'Indo-Arabic Mehndi',
        image_url: 'images/alfiya-work-4.webp',
        display_order: 4,
        featured: true,
        created_at: '2026-11-01T10:03:00.000Z'
      },
      {
        id: 'gal-5',
        title: 'Full-Palm Ornamental',
        description: 'Fine full-palm mehendi with geometric grid and floral ornamental details',
        category_name: 'Pakistani Mehndi',
        image_url: 'images/alfiya-work-5.webp',
        display_order: 5,
        featured: true,
        created_at: '2026-11-01T10:04:00.000Z'
      }
    ],
    services: [
      {
        id: 'srv-1-bridal-full',
        name: 'Royal Bridal Mehendi (Hands & Feet)',
        description:
          'Full bridal coverage for front & back hands up to elbows and detailed bridal feet, including custom motifs and storytelling.',
        starting_price: '₹3,500 onwards (Demo – Confirm with Artist)',
        is_demo_price: true,
        display_order: 1,
        enabled: true
      },
      {
        id: 'srv-2-engagement-sangeet',
        name: 'Engagement & Sangeet Mehendi',
        description:
          'Intricate wrist-to-forearm coverage in Indo-Arabic, Pakistani or Traditional style for engagements and pre-wedding festivities.',
        starting_price: '₹1,500 onwards (Demo – Confirm with Artist)',
        is_demo_price: true,
        display_order: 2,
        enabled: true
      },
      {
        id: 'srv-3-arabic-party',
        name: 'Arabic & Floral Party Mehendi',
        description:
          'Graceful floral trails, shaded petals and contemporary negative-space patterns for family members, bridesmaids and festive occasions.',
        starting_price: '₹300 / hand onwards (Demo – Confirm with Artist)',
        is_demo_price: true,
        display_order: 3,
        enabled: true
      },
      {
        id: 'srv-4-minimalist-jewellery',
        name: 'Minimalist & Jewellery Mehendi',
        description:
          'Delicate hathphool, ring-chain, mandala and anklet-inspired designs for modern celebrations and intimate gatherings.',
        starting_price: '₹250 / hand onwards (Demo – Confirm with Artist)',
        is_demo_price: true,
        display_order: 4,
        enabled: true
      }
    ],
    enquiries: [
      {
        id: 'enq-demo-1',
        customer_name: 'Ayesha Khan (Demo Enquiry)',
        phone: '+91 98765 43210',
        event_date: '2026-12-20',
        service: 'Bridal Mehndi',
        location: 'CIDCO, Aurangabad',
        message: 'Looking for full bridal hands and feet mehendi for my wedding ceremony.',
        status: 'New',
        created_at: '2026-11-12T10:30:00.000Z'
      }
    ]
  };
}

function isSupabaseConfigured() {
  const url = (process.env.SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  return (
    url.startsWith('https://') &&
    !url.includes('your-project-id') &&
    key.length > 20 &&
    !key.includes('your-supabase-service-role')
  );
}

// ============================================================================
// Local File-System Persistent Storage (Used when Supabase env vars are not set)
// ============================================================================
function ensureLocalDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const seed = getInitialSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf8');
  }
}

function readLocalDb() {
  ensureLocalDirs();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    const seed = getInitialSeedData();
    return {
      settings: parsed.settings || seed.settings,
      categories: Array.isArray(parsed.categories) ? parsed.categories : seed.categories,
      gallery: Array.isArray(parsed.gallery) ? parsed.gallery : seed.gallery,
      services: Array.isArray(parsed.services) ? parsed.services : seed.services,
      enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : seed.enquiries
    };
  } catch (_) {
    const seed = getInitialSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf8');
    return seed;
  }
}

function writeLocalDb(data) {
  ensureLocalDirs();
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpFile, DB_FILE);
}

// ============================================================================
// Supabase PostgREST Helper
// ============================================================================
async function supabaseRequest(endpoint, options = {}) {
  const baseUrl = process.env.SUPABASE_URL.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
    ...(options.headers || {})
  };
  const res = await fetch(`${baseUrl}/rest/v1/${endpoint}`, {
    ...options,
    headers
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase API error (${res.status}): ${errText}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function ensureSupabaseSeeded() {
  const seed = getInitialSeedData();
  const settingsRows = await supabaseRequest('site_settings?id=eq.main&select=*');
  if (!settingsRows || settingsRows.length === 0) {
    await supabaseRequest('site_settings', {
      method: 'POST',
      body: JSON.stringify(seed.settings)
    });
  }
  const catRows = await supabaseRequest('categories?select=id&limit=1');
  if (!catRows || catRows.length === 0) {
    await supabaseRequest('categories', {
      method: 'POST',
      body: JSON.stringify(seed.categories)
    });
  }
  const galRows = await supabaseRequest('gallery_images?select=id&limit=1');
  if (!galRows || galRows.length === 0) {
    await supabaseRequest('gallery_images', {
      method: 'POST',
      body: JSON.stringify(seed.gallery)
    });
  }
  const srvRows = await supabaseRequest('services?select=id&limit=1');
  if (!srvRows || srvRows.length === 0) {
    await supabaseRequest('services', {
      method: 'POST',
      body: JSON.stringify(seed.services)
    });
  }
}

// ============================================================================
// Unified Database Operations
// ============================================================================
async function getAllData() {
  if (isSupabaseConfigured()) {
    await ensureSupabaseSeeded();
    const [settingsRows, categories, gallery, services, enquiries] = await Promise.all([
      supabaseRequest('site_settings?id=eq.main&select=*'),
      supabaseRequest('categories?select=*&order=display_order.asc'),
      supabaseRequest('gallery_images?select=*&order=display_order.asc'),
      supabaseRequest('services?select=*&order=display_order.asc'),
      supabaseRequest('enquiries?select=*&order=created_at.desc')
    ]);
    return {
      storageMode: 'supabase',
      settings: (settingsRows && settingsRows[0]) || getInitialSeedData().settings,
      categories: categories || [],
      gallery: gallery || [],
      services: services || [],
      enquiries: enquiries || []
    };
  }

  const db = readLocalDb();
  db.categories.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  db.gallery.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  db.services.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  db.enquiries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return {
    storageMode: 'persistent-file',
    ...db
  };
}

// --- Settings ---
async function updateSettings(updates) {
  const allowedKeys = [
    'artist_name',
    'tagline',
    'whatsapp_number',
    'whatsapp_display',
    'instagram_url',
    'instagram_handle',
    'location',
    'topline_text',
    'hero_kicker',
    'hero_subtitle',
    'experience_years',
    'about_heading',
    'about_paragraph_1',
    'about_paragraph_2',
    'contact_note'
  ];

  const clean = {};
  for (const k of allowedKeys) {
    if (updates[k] !== undefined) {
      clean[k] = String(updates[k]).trim();
    }
  }
  // Keep whatsapp_number digits-only for wa.me links
  if (clean.whatsapp_number) {
    clean.whatsapp_number = clean.whatsapp_number.replace(/[^0-9]/g, '');
  }
  clean.updated_at = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const rows = await supabaseRequest('site_settings?id=eq.main', {
      method: 'PATCH',
      body: JSON.stringify(clean)
    });
    return rows && rows[0];
  }

  const db = readLocalDb();
  db.settings = { ...db.settings, ...clean };
  writeLocalDb(db);
  return db.settings;
}

// --- Categories ---
async function addCategory(cat) {
  const db = await getAllData();
  const maxOrder = db.categories.reduce((m, c) => Math.max(m, Number(c.display_order) || 0), 0);
  const newCat = {
    id: `cat-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    name: String(cat.name || '').trim(),
    description: String(cat.description || '').trim(),
    badge: String(cat.badge || 'Inspiration Ref').trim(),
    foot_note: String(cat.foot_note || 'Hands & feet').trim(),
    display_order:
      cat.display_order !== undefined && cat.display_order !== ''
        ? Number(cat.display_order)
        : maxOrder + 1,
    enabled: cat.enabled !== undefined ? Boolean(cat.enabled) : true,
    images: Array.isArray(cat.images) ? cat.images : []
  };

  if (isSupabaseConfigured()) {
    const rows = await supabaseRequest('categories', {
      method: 'POST',
      body: JSON.stringify(newCat)
    });
    return rows && rows[0];
  }

  const local = readLocalDb();
  local.categories.push(newCat);
  writeLocalDb(local);
  return newCat;
}

async function updateCategory(id, updates) {
  if (isSupabaseConfigured()) {
    const payload = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = String(updates.name).trim();
    if (updates.description !== undefined) payload.description = String(updates.description).trim();
    if (updates.badge !== undefined) payload.badge = String(updates.badge).trim();
    if (updates.foot_note !== undefined) payload.foot_note = String(updates.foot_note).trim();
    if (updates.display_order !== undefined) payload.display_order = Number(updates.display_order);
    if (updates.enabled !== undefined) payload.enabled = Boolean(updates.enabled);
    if (Array.isArray(updates.images)) payload.images = updates.images;

    const rows = await supabaseRequest(`categories?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return rows && rows[0];
  }

  const local = readLocalDb();
  const idx = local.categories.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const existing = local.categories[idx];
  local.categories[idx] = {
    ...existing,
    name: updates.name !== undefined ? String(updates.name).trim() : existing.name,
    description:
      updates.description !== undefined ? String(updates.description).trim() : existing.description,
    badge: updates.badge !== undefined ? String(updates.badge).trim() : existing.badge,
    foot_note: updates.foot_note !== undefined ? String(updates.foot_note).trim() : existing.foot_note,
    display_order:
      updates.display_order !== undefined ? Number(updates.display_order) : existing.display_order,
    enabled: updates.enabled !== undefined ? Boolean(updates.enabled) : existing.enabled,
    images: Array.isArray(updates.images) ? updates.images : existing.images
  };
  writeLocalDb(local);
  return local.categories[idx];
}

async function deleteCategory(id) {
  if (isSupabaseConfigured()) {
    await supabaseRequest(`categories?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return true;
  }
  const local = readLocalDb();
  const initialLen = local.categories.length;
  local.categories = local.categories.filter((c) => c.id !== id);
  writeLocalDb(local);
  return local.categories.length < initialLen;
}

// --- Gallery ---
async function addGalleryImages(items) {
  const db = await getAllData();
  let nextOrder = db.gallery.reduce((m, g) => Math.max(m, Number(g.display_order) || 0), 0) + 1;

  const created = items.map((item) => ({
    id: `gal-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    title: String(item.title || 'Mehendi Design').trim(),
    description: String(item.description || item.title || 'Mehendi design by Alfiya Tamboli').trim(),
    category_name: String(item.category_name || 'Bridal Mehndi').trim(),
    image_url: String(item.image_url || '').trim(),
    display_order:
      item.display_order !== undefined && item.display_order !== ''
        ? Number(item.display_order)
        : nextOrder++,
    featured: item.featured !== undefined ? Boolean(item.featured) : true,
    created_at: new Date().toISOString()
  }));

  if (isSupabaseConfigured()) {
    const rows = await supabaseRequest('gallery_images', {
      method: 'POST',
      body: JSON.stringify(created)
    });
    return rows;
  }

  const local = readLocalDb();
  local.gallery.push(...created);
  writeLocalDb(local);
  return created;
}

async function updateGalleryImage(id, updates) {
  if (isSupabaseConfigured()) {
    const payload = {};
    if (updates.title !== undefined) payload.title = String(updates.title).trim();
    if (updates.description !== undefined) payload.description = String(updates.description).trim();
    if (updates.category_name !== undefined)
      payload.category_name = String(updates.category_name).trim();
    if (updates.image_url !== undefined) payload.image_url = String(updates.image_url).trim();
    if (updates.display_order !== undefined) payload.display_order = Number(updates.display_order);
    if (updates.featured !== undefined) payload.featured = Boolean(updates.featured);

    const rows = await supabaseRequest(`gallery_images?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return rows && rows[0];
  }

  const local = readLocalDb();
  const idx = local.gallery.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  const ex = local.gallery[idx];
  local.gallery[idx] = {
    ...ex,
    title: updates.title !== undefined ? String(updates.title).trim() : ex.title,
    description: updates.description !== undefined ? String(updates.description).trim() : ex.description,
    category_name:
      updates.category_name !== undefined ? String(updates.category_name).trim() : ex.category_name,
    image_url: updates.image_url !== undefined ? String(updates.image_url).trim() : ex.image_url,
    display_order:
      updates.display_order !== undefined ? Number(updates.display_order) : ex.display_order,
    featured: updates.featured !== undefined ? Boolean(updates.featured) : ex.featured
  };
  writeLocalDb(local);
  return local.gallery[idx];
}

async function deleteGalleryImage(id) {
  if (isSupabaseConfigured()) {
    await supabaseRequest(`gallery_images?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return true;
  }
  const local = readLocalDb();
  const before = local.gallery.length;
  local.gallery = local.gallery.filter((g) => g.id !== id);
  writeLocalDb(local);
  return local.gallery.length < before;
}

// --- Services & Pricing ---
async function addService(srv) {
  const db = await getAllData();
  const maxOrder = db.services.reduce((m, s) => Math.max(m, Number(s.display_order) || 0), 0);
  const newSrv = {
    id: `srv-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    name: String(srv.name || '').trim(),
    description: String(srv.description || '').trim(),
    starting_price: String(srv.starting_price || '').trim(),
    is_demo_price: srv.is_demo_price !== undefined ? Boolean(srv.is_demo_price) : true,
    display_order:
      srv.display_order !== undefined && srv.display_order !== ''
        ? Number(srv.display_order)
        : maxOrder + 1,
    enabled: srv.enabled !== undefined ? Boolean(srv.enabled) : true,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    const rows = await supabaseRequest('services', {
      method: 'POST',
      body: JSON.stringify(newSrv)
    });
    return rows && rows[0];
  }

  const local = readLocalDb();
  local.services.push(newSrv);
  writeLocalDb(local);
  return newSrv;
}

async function updateService(id, updates) {
  if (isSupabaseConfigured()) {
    const payload = {};
    if (updates.name !== undefined) payload.name = String(updates.name).trim();
    if (updates.description !== undefined) payload.description = String(updates.description).trim();
    if (updates.starting_price !== undefined)
      payload.starting_price = String(updates.starting_price).trim();
    if (updates.is_demo_price !== undefined) payload.is_demo_price = Boolean(updates.is_demo_price);
    if (updates.display_order !== undefined) payload.display_order = Number(updates.display_order);
    if (updates.enabled !== undefined) payload.enabled = Boolean(updates.enabled);

    const rows = await supabaseRequest(`services?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return rows && rows[0];
  }

  const local = readLocalDb();
  const idx = local.services.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  const ex = local.services[idx];
  local.services[idx] = {
    ...ex,
    name: updates.name !== undefined ? String(updates.name).trim() : ex.name,
    description: updates.description !== undefined ? String(updates.description).trim() : ex.description,
    starting_price:
      updates.starting_price !== undefined ? String(updates.starting_price).trim() : ex.starting_price,
    is_demo_price:
      updates.is_demo_price !== undefined ? Boolean(updates.is_demo_price) : ex.is_demo_price,
    display_order:
      updates.display_order !== undefined ? Number(updates.display_order) : ex.display_order,
    enabled: updates.enabled !== undefined ? Boolean(updates.enabled) : ex.enabled
  };
  writeLocalDb(local);
  return local.services[idx];
}

async function deleteService(id) {
  if (isSupabaseConfigured()) {
    await supabaseRequest(`services?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return true;
  }
  const local = readLocalDb();
  const before = local.services.length;
  local.services = local.services.filter((s) => s.id !== id);
  writeLocalDb(local);
  return local.services.length < before;
}

// --- Booking Enquiries ---
const VALID_STATUSES = ['New', 'Contacted', 'Confirmed', 'Completed', 'Cancelled'];

async function addEnquiry(enq) {
  const newEnq = {
    id: `enq-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    customer_name: String(enq.customer_name || '').trim(),
    phone: String(enq.phone || '').trim(),
    event_date: String(enq.event_date || '').trim(),
    service: String(enq.service || '').trim(),
    location: String(enq.location || '').trim(),
    message: String(enq.message || '').trim(),
    status: 'New',
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    const rows = await supabaseRequest('enquiries', {
      method: 'POST',
      body: JSON.stringify(newEnq)
    });
    return rows && rows[0];
  }

  const local = readLocalDb();
  local.enquiries.unshift(newEnq);
  writeLocalDb(local);
  return newEnq;
}

async function updateEnquiryStatus(id, status) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid enquiry status. Allowed: ${VALID_STATUSES.join(', ')}`);
  }

  if (isSupabaseConfigured()) {
    const rows = await supabaseRequest(`enquiries?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return rows && rows[0];
  }

  const local = readLocalDb();
  const idx = local.enquiries.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  local.enquiries[idx].status = status;
  writeLocalDb(local);
  return local.enquiries[idx];
}

async function deleteEnquiry(id) {
  if (isSupabaseConfigured()) {
    await supabaseRequest(`enquiries?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return true;
  }
  const local = readLocalDb();
  const before = local.enquiries.length;
  local.enquiries = local.enquiries.filter((e) => e.id !== id);
  writeLocalDb(local);
  return local.enquiries.length < before;
}

// --- Persistent Image Upload (Supabase Storage or Local Persistent `uploads/` Directory) ---
const ALLOWED_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 MB max per image

async function storeUploadedImage({ base64Data, mimeType, originalName }) {
  const cleanMime = String(mimeType || '').toLowerCase();
  const ext = ALLOWED_MIME_TYPES[cleanMime];
  if (!ext) {
    throw new Error('Unsupported file type. Only JPEG, PNG and WebP images are allowed.');
  }

  const cleanBase64 = String(base64Data || '').replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');

  if (!buffer || buffer.length === 0) {
    throw new Error('Empty image data.');
  }
  if (buffer.length > MAX_UPLOAD_BYTES) {
    throw new Error('Image exceeds the 4 MB maximum file size limit.');
  }

  // Verify magic bytes for security
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng =
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  const isWebp =
    buffer.slice(0, 4).toString('ascii') === 'RIFF' &&
    buffer.slice(8, 12).toString('ascii') === 'WEBP';

  if (!isJpeg && !isPng && !isWebp) {
    throw new Error('Invalid image file signature.');
  }

  const safeBase = String(originalName || 'mehndi')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40)
    .toLowerCase();
  const fileName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${safeBase || 'design'}${ext}`;

  if (isSupabaseConfigured()) {
    const baseUrl = process.env.SUPABASE_URL.replace(/\/$/, '');
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = (process.env.SUPABASE_STORAGE_BUCKET || 'alfiya-media').trim();
    const uploadRes = await fetch(`${baseUrl}/storage/v1/object/${bucket}/${fileName}`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': cleanMime,
        'x-upsert': 'true'
      },
      body: buffer
    });
    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Supabase Storage upload failed: ${errText}`);
    }
    return {
      url: `${baseUrl}/storage/v1/object/public/${bucket}/${fileName}`,
      fileName,
      size: buffer.length
    };
  }

  ensureLocalDirs();
  const destPath = path.join(UPLOADS_DIR, fileName);
  fs.writeFileSync(destPath, buffer);
  return {
    url: `/uploads/${fileName}`,
    fileName,
    size: buffer.length
  };
}

module.exports = {
  UPLOADS_DIR,
  VALID_STATUSES,
  isSupabaseConfigured,
  getAllData,
  updateSettings,
  addCategory,
  updateCategory,
  deleteCategory,
  addGalleryImages,
  updateGalleryImage,
  deleteGalleryImage,
  addService,
  updateService,
  deleteService,
  addEnquiry,
  updateEnquiryStatus,
  deleteEnquiry,
  storeUploadedImage
};

