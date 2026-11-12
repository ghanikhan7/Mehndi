-- ============================================================================
-- ALFIYA TAMBOLI – MEHENDI WEBSITE & MINI CMS
-- Supabase PostgreSQL Database Schema & Initial Seed Data
-- Run this script in your Supabase SQL Editor before deploying to Vercel.
-- ============================================================================

-- 1. Site Settings Table (Single-row configuration record)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  artist_name TEXT NOT NULL DEFAULT 'Alfiya Tamboli',
  tagline TEXT NOT NULL DEFAULT 'The Mehendi Artist',
  whatsapp_number TEXT NOT NULL DEFAULT '917057703257',
  whatsapp_display TEXT NOT NULL DEFAULT '+91 70577 03257',
  instagram_url TEXT NOT NULL DEFAULT 'https://www.instagram.com/aurangabad_mehendi_by_alfiya/',
  instagram_handle TEXT NOT NULL DEFAULT '@aurangabad_mehendi_by_alfiya',
  location TEXT NOT NULL DEFAULT 'Aurangabad, Maharashtra',
  topline_text TEXT NOT NULL DEFAULT 'Bridal · Party · Festive Mehendi   |   Aurangabad & Surrounding Areas',
  hero_kicker TEXT NOT NULL DEFAULT 'Artistry for your once-in-a-lifetime moments',
  hero_subtitle TEXT NOT NULL DEFAULT 'Intricate bridal, Arabic and festive mehendi, thoughtfully designed for your special moments. Alfiya brings detail, elegance and a personal touch to every design across Aurangabad.',
  experience_years TEXT NOT NULL DEFAULT '5+',
  about_heading TEXT NOT NULL DEFAULT 'Alfiya Tamboli',
  about_paragraph_1 TEXT NOT NULL DEFAULT 'Bridal and party mehendi artist based in Aurangabad, Maharashtra. With a passion for fine detailing and traditional artistry, Alfiya creates bespoke henna designs that complement your celebration and personal style.',
  about_paragraph_2 TEXT NOT NULL DEFAULT 'Whether you have a favourite inspiration reference or want a custom design crafted around your bridal outfit and occasion, let’s plan something beautiful together.',
  contact_note TEXT NOT NULL DEFAULT 'Citywide availability in Aurangabad · Enquire for outstation travel',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Mehendi Categories Table (Supports 7 initial categories + CRUD + multiple images JSONB)
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  badge TEXT NOT NULL DEFAULT 'Inspiration Ref',
  foot_note TEXT NOT NULL DEFAULT 'Hands & feet',
  display_order INTEGER NOT NULL DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Portfolio Gallery Images Table
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category_name TEXT NOT NULL DEFAULT 'Bridal Mehndi',
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 1,
  featured BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Services & Pricing Table
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  starting_price TEXT NOT NULL,
  is_demo_price BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Booking Enquiries Table
CREATE TABLE IF NOT EXISTS public.enquiries (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  event_date TEXT NOT NULL,
  service TEXT NOT NULL,
  location TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Confirmed', 'Completed', 'Cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast sorting & filtering
CREATE INDEX IF NOT EXISTS idx_categories_order ON public.categories (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_gallery_order ON public.gallery_images (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_services_order ON public.services (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON public.enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries (status);

-- ============================================================================
-- Supabase Storage Bucket for Uploaded Gallery & Category Images
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('alfiya-media', 'alfiya-media', true)
ON CONFLICT (id) DO NOTHING;

