-- =============================================
-- Leridia Jewels - Secure Supabase Setup / Migration
-- Run this in Supabase SQL Editor for both new and existing projects.
-- =============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    inventory_item_code TEXT,
    purchase_date DATE,
    jewelry_type TEXT,
    description TEXT,
    collection TEXT,
    chains TEXT,
    materials TEXT,
    addons TEXT,
    size TEXT,
    quality TEXT,
    stock INTEGER DEFAULT 0,
    total_number_in_stock INTEGER DEFAULT 0,
    quantity_bought INTEGER DEFAULT 0,
    total_stocks_left INTEGER DEFAULT 0,
    weight_grams NUMERIC,
    estimated_price NUMERIC DEFAULT 0,
    buying_price NUMERIC DEFAULT 0,
    selling_price NUMERIC DEFAULT 0,
    profit_margin NUMERIC DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
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
    deleted_at TIMESTAMPTZ,
    deleted_by_email TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS inventory_item_code TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS purchase_date DATE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS jewelry_type TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS collection TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS chains TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS materials TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS addons TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS quality TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS total_number_in_stock INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS quantity_bought INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS total_stocks_left INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight_grams NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS estimated_price NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS buying_price NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS selling_price NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS profit_margin NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS local_price NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS local_selling NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS abroad_price NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS abroad_selling NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS local_image_file TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS local_image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS abroad_image_file TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS abroad_image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_name_image TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS collection_image TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS material_image TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS addon_image TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS deleted_by_email TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.products ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.products ALTER COLUMN stock SET DEFAULT 0;
ALTER TABLE public.products ALTER COLUMN total_number_in_stock SET DEFAULT 0;
ALTER TABLE public.products ALTER COLUMN quantity_bought SET DEFAULT 0;
ALTER TABLE public.products ALTER COLUMN total_stocks_left SET DEFAULT 0;
ALTER TABLE public.products ALTER COLUMN estimated_price SET DEFAULT 0;
ALTER TABLE public.products ALTER COLUMN buying_price SET DEFAULT 0;
ALTER TABLE public.products ALTER COLUMN selling_price SET DEFAULT 0;
ALTER TABLE public.products ALTER COLUMN profit_margin SET DEFAULT 0;
ALTER TABLE public.products ALTER COLUMN total_amount SET DEFAULT 0;
ALTER TABLE public.products ALTER COLUMN local_price SET DEFAULT 0;
ALTER TABLE public.products ALTER COLUMN local_selling SET DEFAULT 0;
ALTER TABLE public.products ALTER COLUMN abroad_price SET DEFAULT 0;
ALTER TABLE public.products ALTER COLUMN abroad_selling SET DEFAULT 0;
ALTER TABLE public.products ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.products ALTER COLUMN updated_at SET DEFAULT now();

UPDATE public.products
SET created_at = COALESCE(created_at, now()),
    updated_at = COALESCE(updated_at, now())
WHERE created_at IS NULL
   OR updated_at IS NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'products'
          AND column_name = 'category'
    ) THEN
        EXECUTE '
            UPDATE public.products
            SET collection = COALESCE(collection, category),
                jewelry_type = COALESCE(jewelry_type, category)
            WHERE category IS NOT NULL
        ';
        EXECUTE 'ALTER TABLE public.products ALTER COLUMN category DROP NOT NULL';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'products'
          AND column_name = 'type'
    ) THEN
        EXECUTE '
            UPDATE public.products
            SET chains = COALESCE(chains, type),
                jewelry_type = COALESCE(jewelry_type, type)
            WHERE type IS NOT NULL
        ';
        EXECUTE 'ALTER TABLE public.products ALTER COLUMN type DROP NOT NULL';
    END IF;
END;
$$;

UPDATE public.products
SET inventory_item_code = COALESCE(inventory_item_code, sku),
    jewelry_type = COALESCE(jewelry_type, collection, chains),
    description = COALESCE(description, name),
    buying_price = COALESCE(buying_price, local_price, 0),
    selling_price = COALESCE(selling_price, local_selling, abroad_selling, 0),
    estimated_price = COALESCE(estimated_price, abroad_price, local_selling, 0),
    total_number_in_stock = COALESCE(total_number_in_stock, stock, 0),
    quantity_bought = COALESCE(quantity_bought, stock, 0),
    total_stocks_left = COALESCE(total_stocks_left, stock, 0)
WHERE inventory_item_code IS NULL
   OR jewelry_type IS NULL
   OR description IS NULL
   OR buying_price IS NULL
   OR selling_price IS NULL
   OR estimated_price IS NULL
   OR total_number_in_stock IS NULL
   OR quantity_bought IS NULL
   OR total_stocks_left IS NULL;

UPDATE public.products
SET profit_margin = CASE
        WHEN COALESCE(buying_price, 0) > 0
            THEN ROUND(((COALESCE(selling_price, 0) - COALESCE(buying_price, 0)) / COALESCE(buying_price, 1)) * 100, 2)
        ELSE 0
    END,
    total_amount = COALESCE(quantity_bought, 0) * COALESCE(buying_price, 0),
    stock = COALESCE(total_stocks_left, stock, 0)
WHERE profit_margin IS NULL
   OR total_amount IS NULL
   OR stock IS NULL
   OR stock IS DISTINCT FROM COALESCE(total_stocks_left, stock, 0);

CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_inventory_item_code ON public.products(inventory_item_code);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON public.products(deleted_at);

CREATE TABLE IF NOT EXISTS public.admin_users (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.deleted_products_audit (
    audit_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id UUID,
    deleted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_by_email TEXT,
    product_data JSONB NOT NULL
);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE lower(email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
    );
$$;

CREATE OR REPLACE FUNCTION public.audit_deleted_product()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.deleted_products_audit (
        product_id,
        deleted_at,
        deleted_by_email,
        product_data
    )
    VALUES (
        OLD.id,
        now(),
        COALESCE(auth.jwt() ->> 'email', OLD.deleted_by_email),
        to_jsonb(OLD)
    );

    RETURN OLD;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS audit_products_before_delete ON public.products;
CREATE TRIGGER audit_products_before_delete
    BEFORE DELETE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_deleted_product();

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deleted_products_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access" ON public.products;
DROP POLICY IF EXISTS "Allow public read access" ON public.products;
DROP POLICY IF EXISTS "Allow public insert access" ON public.products;
DROP POLICY IF EXISTS "Allow public update access" ON public.products;
DROP POLICY IF EXISTS "Allow public delete access" ON public.products;
DROP POLICY IF EXISTS "Admins can read products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can read deleted product audit" ON public.deleted_products_audit;

CREATE POLICY "Admins can read products" ON public.products
    FOR SELECT
    USING (public.is_admin_user());

CREATE POLICY "Admins can insert products" ON public.products
    FOR INSERT
    WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update products" ON public.products
    FOR UPDATE
    USING (public.is_admin_user())
    WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can read deleted product audit" ON public.deleted_products_audit
    FOR SELECT
    USING (public.is_admin_user());

REVOKE ALL ON TABLE public.admin_users FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO anon, authenticated;

-- =============================================
-- After running this script:
-- 1. Create your admin user in Supabase Authentication.
-- 2. Add the approved email(s), for example:
--    INSERT INTO public.admin_users (email)
--    VALUES ('you@example.com')
--    ON CONFLICT (email) DO NOTHING;
-- 3. Sign in from the app.
-- =============================================
