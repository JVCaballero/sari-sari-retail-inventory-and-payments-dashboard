// Domain Models and Types for TindaHalin POS-lite

export type BusinessType = 'sari_sari' | 'carinderia' | 'mixed';
export type ItemType = 'retail' | 'dish' | 'ingredient' | 'service';
export type SaleStatus = 'completed' | 'voided' | 'refunded';
export type PaymentMethod = 'cash' | 'qrph' | 'credit' | 'other';
export type PaymentStatus = 
  | 'pending'
  | 'merchant_confirmed'
  | 'provider_confirmed'
  | 'failed'
  | 'refunded'
  | 'disputed';

export type MovementType = 
  | 'opening'
  | 'stock_in'
  | 'sale'
  | 'return'
  | 'waste'
  | 'personal_use'
  | 'adjustment';

export type CreditEntryType = 'charge' | 'payment' | 'adjustment';

export interface Store {
  id: string;
  name: string;
  business_type: BusinessType;
  currency: string;
  locale: string;
  tax_profile: string;
  created_at: string;
  updated_at: string;
  owner_pin?: string;
  qr_merchant_name?: string;
  qr_provider?: string;
  qr_image_url?: string;
}

export interface Product {
  id: string;
  store_id: string;
  sku: string | null;
  barcode: string | null;
  name: string;
  category: string;
  base_unit: string;
  item_type: ItemType;
  cost_centavos: number | null; // stored as integer centavos
  price_centavos: number;      // stored as integer centavos
  stock_qty_milli: number;     // stored as integer thousandths (1000 = 1 unit)
  low_stock_qty_milli: number | null;
  is_active: number;          // 1 or 0
  created_at: string;
  updated_at: string;
  version: number;
  is_favorite?: boolean;
  is_sold_out?: boolean;      // for carinderia daily menu
  prepared_qty_milli?: number; // for carinderia daily prepared servings
}

export interface CartItem {
  product: Product;
  qty_milli: number;          // quantity in thousandths
  unit_price_centavos: number;
  line_total_centavos: number;
  selected_unit_label?: string;
  unit_conversion_factor?: number; // e.g. 1 pack = 12 pieces
}

export interface Sale {
  id: string;
  store_id: string;
  sale_number: string;
  status: SaleStatus;
  subtotal_centavos: number;
  discount_centavos: number;
  total_centavos: number;
  customer_id: string | null;
  cashier_name: string | null;
  sold_at: string;
  closed_day: string | null;
  created_at: string;
  items?: SaleItem[];
  payments?: Payment[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name_snapshot: string;
  unit_snapshot: string;
  qty_milli: number;
  unit_price_centavos: number;
  unit_cost_centavos: number | null;
  line_total_centavos: number;
}

export interface Payment {
  id: string;
  sale_id: string;
  method: PaymentMethod;
  provider: string | null;
  amount_centavos: number;
  status: PaymentStatus;
  reference_suffix: string | null;
  verification_source: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface InventoryMovement {
  id: string;
  store_id: string;
  product_id: string;
  movement_type: MovementType;
  qty_delta_milli: number;
  unit_cost_centavos: number | null;
  sale_id: string | null;
  reason: string | null;
  occurred_at: string;
  created_at: string;
  product_name?: string;
}

export interface Customer {
  id: string;
  store_id: string;
  display_name: string;
  phone: string | null;
  notes: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
  current_balance_centavos?: number;
}

export interface CreditEntry {
  id: string;
  customer_id: string;
  sale_id: string | null;
  entry_type: CreditEntryType;
  amount_centavos: number;
  note: string | null;
  occurred_at: string;
}

export interface SyncOutbox {
  id: string;
  entity_type: string;
  entity_id: string;
  operation: string;
  payload_json: string;
  idempotency_key: string;
  attempt_count: number;
  created_at: string;
  synced_at: string | null;
}

export interface StoreConfig {
  store_name: string;
  address?: string;
  phone?: string;
  qrph_account_name?: string;
  qrph_number?: string;
  receipt_footer_note?: string;
  tax_id_or_tin?: string;
  receipt_logo_url?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface DailySummary {
  date: string;
  total_gross_centavos: number;
  cash_centavos: number;
  qrph_centavos: number;
  credit_centavos: number;
  estimated_cost_centavos: number;
  estimated_gross_margin_centavos: number;
  transaction_count: number;
  pending_qr_count: number;
  low_stock_count: number;
  cash_count_centavos?: number;
  variance_centavos?: number;
  closing_notes?: string;
  closed_at?: string;
}
