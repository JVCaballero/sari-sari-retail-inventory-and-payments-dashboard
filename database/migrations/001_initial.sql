-- Migration 001_initial.sql
-- Initial database creation for TindaHalin

CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (business_type IN ('sari_sari', 'carinderia', 'mixed')),
  currency TEXT NOT NULL DEFAULT 'PHP',
  locale TEXT NOT NULL DEFAULT 'en-PH',
  tax_profile TEXT NOT NULL DEFAULT 'management_only',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id),
  sku TEXT,
  barcode TEXT,
  name TEXT NOT NULL,
  category TEXT,
  base_unit TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('retail', 'dish', 'ingredient', 'service')),
  cost_centavos INTEGER,
  price_centavos INTEGER NOT NULL,
  stock_qty_milli INTEGER NOT NULL DEFAULT 0,
  low_stock_qty_milli INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id),
  sale_number TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'voided', 'refunded')),
  subtotal_centavos INTEGER NOT NULL,
  discount_centavos INTEGER NOT NULL DEFAULT 0,
  total_centavos INTEGER NOT NULL,
  customer_id TEXT,
  cashier_name TEXT,
  sold_at TEXT NOT NULL,
  closed_day TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sale_items (
  id TEXT PRIMARY KEY,
  sale_id TEXT NOT NULL REFERENCES sales(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  product_name_snapshot TEXT NOT NULL,
  unit_snapshot TEXT NOT NULL,
  qty_milli INTEGER NOT NULL,
  unit_price_centavos INTEGER NOT NULL,
  unit_cost_centavos INTEGER,
  line_total_centavos INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  sale_id TEXT NOT NULL REFERENCES sales(id),
  method TEXT NOT NULL CHECK (method IN ('cash', 'qrph', 'credit', 'other')),
  provider TEXT,
  amount_centavos INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('pending', 'merchant_confirmed', 'provider_confirmed', 'failed', 'refunded', 'disputed')
  ),
  reference_suffix TEXT,
  verification_source TEXT,
  paid_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  movement_type TEXT NOT NULL CHECK (
    movement_type IN ('opening', 'stock_in', 'sale', 'return', 'waste', 'personal_use', 'adjustment')
  ),
  qty_delta_milli INTEGER NOT NULL,
  unit_cost_centavos INTEGER,
  sale_id TEXT,
  reason TEXT,
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id),
  display_name TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS credit_entries (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  sale_id TEXT,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('charge', 'payment', 'adjustment')),
  amount_centavos INTEGER NOT NULL,
  note TEXT,
  occurred_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_outbox (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  synced_at TEXT
);
