-- =============================================
-- Leridia Jewels - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor
-- =============================================

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    collection VARCHAR(255),
    chains VARCHAR(255),
    materials TEXT,
    addons TEXT,
    size VARCHAR(50),
    quality VARCHAR(100),
    stock INTEGER NOT NULL DEFAULT 0,
    weight_grams DECIMAL(10, 2),
    local_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    local_selling DECIMAL(10, 2) NOT NULL DEFAULT 0,
    abroad_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    abroad_selling DECIMAL(10, 2) NOT NULL DEFAULT 0,
    local_image_file TEXT,
    local_image_url TEXT,
    abroad_image_file TEXT,
    abroad_image_url TEXT,
    product_name_image TEXT,
    collection_image TEXT,
    material_image TEXT,
    addon_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow full public access (no auth required)
CREATE POLICY "Allow public read access" ON products
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON products
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON products
    FOR DELETE USING (true);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
