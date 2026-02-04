-- Migration: Add new image fields and migrate existing data
-- Date: 2024
-- Description: Adds separate fields for local and abroad images (both file and URL)

-- Step 1: Add new columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS local_image_file TEXT,
ADD COLUMN IF NOT EXISTS local_image_url TEXT,
ADD COLUMN IF NOT EXISTS abroad_image_file TEXT,
ADD COLUMN IF NOT EXISTS abroad_image_url TEXT;

-- Step 2: Migrate existing data
-- Migrate image_path (base64 local images) to local_image_file
UPDATE products 
SET local_image_file = image_path 
WHERE image_path IS NOT NULL;

-- Migrate image_url (abroad URLs) to abroad_image_url
UPDATE products 
SET abroad_image_url = image_url 
WHERE image_url IS NOT NULL;

-- Step 3: Drop old columns (OPTIONAL - uncomment if you want to remove old fields)
-- ALTER TABLE products 
-- DROP COLUMN IF EXISTS image_path,
-- DROP COLUMN IF EXISTS image_url;

-- Verify migration
SELECT 
    COUNT(*) as total_products,
    COUNT(local_image_file) as products_with_local_file,
    COUNT(local_image_url) as products_with_local_url,
    COUNT(abroad_image_file) as products_with_abroad_file,
    COUNT(abroad_image_url) as products_with_abroad_url
FROM products;
