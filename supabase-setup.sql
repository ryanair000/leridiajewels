-- =============================================
-- Leridia Jewels - Supabase Database Setup
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================

-- Create the products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    collection TEXT,
    chains TEXT,
    materials TEXT,
    addons TEXT,
    size TEXT,
    quality TEXT,
    stock INTEGER DEFAULT 0,
    weight_grams NUMERIC,
    local_price NUMERIC DEFAULT 0,
    local_selling NUMERIC DEFAULT 0,
    abroad_price NUMERIC DEFAULT 0,
    abroad_selling NUMERIC DEFAULT 0,
    local_image_file TEXT,
    local_image_url TEXT,
    abroad_image_file TEXT,
    abroad_image_url TEXT,
    product_name_image TEXT,
    collection_image TEXT,
    material_image TEXT,
    addon_image TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Disable Row Level Security (private admin tool, no public access)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anonymous users (since this is a private tool)
CREATE POLICY "Allow all access" ON products
    FOR ALL
    USING (true)
    WITH CHECK (true);
