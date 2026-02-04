-- =============================================
-- Leridia Jewels - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor
-- =============================================

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    size VARCHAR(50),
    quality VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    local_price DECIMAL(10, 2) NOT NULL,
    local_selling DECIMAL(10, 2) NOT NULL,
    abroad_price DECIMAL(10, 2) NOT NULL,
    abroad_selling DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for public access)
-- Adjust these policies based on your authentication needs
CREATE POLICY "Allow public read access" ON products
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON products
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON products
    FOR DELETE USING (true);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- OPTIONAL: Insert sample data
-- =============================================
/*
INSERT INTO products (name, sku, category, type, size, quality, stock, local_price, local_selling, abroad_price, abroad_selling, description)
VALUES 
    ('Golden Rose Stud Earrings', 'LJ-EAST-0001', 'Earrings', 'Studs', 'Small', 'Gold plated', 25, 1500.00, 2999.00, 1800.00, 3999.00, 'Elegant rose design stud earrings'),
    ('Pearl Drop Necklace', 'LJ-NEST-0002', 'Necklaces', 'Pendant', 'Medium', 'Silver 925', 8, 4500.00, 8999.00, 5500.00, 11999.00, 'Beautiful pearl pendant necklace'),
    ('Minimalist Band Ring', 'LJ-RIMI-0003', 'Rings', 'Minimalist ring', 'Small', 'Stainless steel', 0, 1200.00, 2499.00, 1500.00, 3499.00, 'Simple and elegant minimalist ring'),
    ('Twisted Rope Bangle', 'LJ-BRBA-0004', 'Bracelets/Bangles', 'Twisted / rope bangles', 'Large', 'Gold plated', 15, 2800.00, 5499.00, 3500.00, 7499.00, 'Beautiful twisted rope design bangle'),
    ('Crystal Charm Anklet', 'LJ-ANCH-0005', 'Anklets', 'Charm anklet', 'Medium', 'Gemstones', 12, 2200.00, 4499.00, 2800.00, 5999.00, 'Sparkling crystal charm anklet');
*/
