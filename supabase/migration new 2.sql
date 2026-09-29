-- -----------------------------------------------------
-- Enum types (kept in a separate schema for clarity)
-- -----------------------------------------------------
CREATE TYPE category_status AS ENUM ('active', 'hidden');
CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');

-- -----------------------------------------------------
-- Table: categories
-- -----------------------------------------------------
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,               -- optional path to an image
    parent_category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    status category_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- -----------------------------------------------------
-- Table: product_variants (optional – one row = one SKU)
-- -----------------------------------------------------
CREATE TABLE product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size TEXT,                         -- e.g. "200ml", "50ml"
    scent  TEXT,                       -- e.g. "lavender", null
    price_modifier NUMERIC(12,2) NOT NULL DEFAULT 0,   -- extra amount added to base price
    sku_suffix TEXT,                   -- optional suffix added to the product SKU
    display_name TEXT GENERATED ALWAYS AS (
        CASE
            WHEN size IS NOT NULL AND scent IS NOT NULL THEN CONCAT(size, ' – ', scent)
            WHEN size IS NOT NULL THEN size
            WHEN scent IS NOT NULL THEN scent
            ELSE NULL
        END
    END,
    CONSTRAINT uq_product_variant_unique UNIQUE (product_id, size, scent)
);

-- -----------------------------------------------------
-- Table: products
-- -----------------------------------------------------
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT,           -- for cards / listings
    description TEXT,                 -- rich text or markdown (store as plain text; render logic in the UI)
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    -- many‑to‑many link is handled by the junction table below
    price NUMERIC(12,2) NOT NULL CHECK (price > 0),
    compare_at_price NUMERIC(12,2),   -- nullable – show “old price” / discount
    sku TEXT UNIQUE NOT NULL,
    stock_quantity INTEGER NOT NULL NOT NULL DEFAULT 0,   -- 0 = out of stock; -1 = unlimited
    status product_status NOT NULL DEFAULT 'draft',
    rating_average NUMERIC(3,2) NOT NULL DEFAULT 0,     -- 0‑5, two‑decimal precision
    rating_count INTEGER NOT NULL NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- -----------------------------------------------------
-- Junction: product ⇆ categories (many‑to‑many)
-- -----------------------------------------------------
CREATE TABLE product_categories (
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- -----------------------------------------------------
-- Table: orders
-- -----------------------------------------------------
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,               -- e.g. "#1024"
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    -- shipping address (all stored as plain text; UI can format)
    shipping_address TEXT NOT NULL,
    billing_address TEXT,
    -- line‑items are stored in a separate table (see order_items)
    subtotal NUMERIC(12,2) NOT NULL NOT NULL DEFAULT 0,
    shipping_cost NUMERIC(12,2) NOT NULL NOT NULL DEFAULT 0,
    tax NUMERIC(12,2) NOT NULL NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL NOT NULL DEFAULT 0,
    order_status order_status NOT NULL DEFAULT 'pending',
    payment_status payment_status NOT NULL DEFAULT 'unpaid',
    payment_method TEXT,                           -- e.g. "credit_card", "cash_on_delivery"
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now,

    -- JSONB array that records every status change for audit purposes
    status_history JSONB NOT NULL DEFAULT '[]'
);

-- -----------------------------------------------------
-- Table: order_items (one row per product/variant in the order)
-- -----------------------------------------------------
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    variant_id BIGINT REFERENCES product_variants(id),   -- null if no variant
    quantity INTEGER NOT NULL NOT NULL DEFAULT 1,
    price_at_purchase NUMERIC(12,2) NOT NULL NOT NULL CHECK (price_at_purchase > 0),   -- snapshot
    total_line NUMERIC(12,2) NOT NULL NOT NULL CHECK (total_line = quantity * price_at_purchase)
);

-- -----------------------------------------------------
-- Table: reviews
-- -----------------------------------------------------
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,                 -- internal use only, not displayed publicly
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title TEXT,                                   -- optional
    body TEXT NOT NULL,
    image_url TEXT,                               -- optional photo‑review URL
    status review_status NOT NULL DEFAULT 'pending',
    verified_purchase BOOLEAN NOT NULL NOT NULL DEFAULT FALSE,
    admin_reply TEXT,
    admin_replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- -----------------------------------------------------
-- Junction: product ⇆ categories (many‑to‑many) – already defined above
-- -----------------------------------------------------