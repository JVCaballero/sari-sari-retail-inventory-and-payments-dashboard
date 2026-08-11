// Embedded Local Database Service for TindaHalin
// Provides local persistent storage complying with SQLite schema specification

import {
  Store,
  StoreConfig,
  Category,
  Product,
  Sale,
  SaleItem,
  Payment,
  InventoryMovement,
  Customer,
  CreditEntry,
  SyncOutbox,
  DailySummary,
  CartItem,
  PaymentMethod,
  PaymentStatus,
  MovementType,
} from '@/lib/types/domain';
import sampleSeedData from '@/database/seed.sample.json';

const STORAGE_KEY = 'tindahalin_sqlite_db_v1';

interface LocalDBState {
  store: Store;
  products: Product[];
  sales: Sale[];
  sale_items: SaleItem[];
  payments: Payment[];
  inventory_movements: InventoryMovement[];
  customers: Customer[];
  credit_entries: CreditEntry[];
  sync_outbox: SyncOutbox[];
  daily_summaries?: DailySummary[];
}

export class DatabaseService {
  private static instance: DatabaseService;
  private state: LocalDBState | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async init(): Promise<void> {
    if (this.isInitialized && this.state) return;

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          this.state = JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse local DB state, seeding fresh...', e);
          this.state = this.getInitialSeedState();
          this.saveToStorage();
        }
      } else {
        this.state = this.getInitialSeedState();
        this.saveToStorage();
      }
    } else {
      this.state = this.getInitialSeedState();
    }

    this.isInitialized = true;
  }

  private getInitialSeedState(): LocalDBState {
    const now = new Date().toISOString();
    const seedStore: Store = {
      id: sampleSeedData.store.id,
      name: sampleSeedData.store.name,
      business_type: sampleSeedData.store.business_type as any,
      currency: sampleSeedData.store.currency,
      locale: sampleSeedData.store.locale,
      tax_profile: sampleSeedData.store.tax_profile,
      created_at: now,
      updated_at: now,
      owner_pin: '1234',
      qr_merchant_name: 'Aling Nena Store QR',
      qr_provider: 'GCash / Maya QR Ph',
      qr_image_url: 'https://picsum.photos/seed/qrph/300/300',
    };

    const seedProducts: Product[] = sampleSeedData.products.map((p) => ({
      id: p.id,
      store_id: seedStore.id,
      sku: p.sku || null,
      barcode: p.barcode || null,
      name: p.name,
      category: p.category,
      base_unit: p.base_unit,
      item_type: p.item_type as any,
      cost_centavos: p.cost_centavos,
      price_centavos: p.price_centavos,
      stock_qty_milli: p.stock_qty_milli,
      low_stock_qty_milli: p.low_stock_qty_milli,
      is_active: 1,
      created_at: now,
      updated_at: now,
      version: 1,
      is_favorite: p.item_type === 'dish' || p.category === 'noodles' || p.category === 'drinks',
      is_sold_out: false,
      prepared_qty_milli: p.item_type === 'dish' ? p.stock_qty_milli : 0,
    }));

    const seedCustomers: Customer[] = sampleSeedData.customers.map((c) => ({
      id: c.id,
      store_id: seedStore.id,
      display_name: c.display_name,
      phone: c.phone || null,
      notes: c.notes || null,
      is_active: 1,
      created_at: now,
      updated_at: now,
      current_balance_centavos: 0,
    }));

    return {
      store: seedStore,
      products: seedProducts,
      sales: [],
      sale_items: [],
      payments: [],
      inventory_movements: seedProducts.map((p) => ({
        id: `mov-init-${p.id}`,
        store_id: seedStore.id,
        product_id: p.id,
        movement_type: 'opening',
        qty_delta_milli: p.stock_qty_milli,
        unit_cost_centavos: p.cost_centavos,
        sale_id: null,
        reason: 'Initial opening inventory seed',
        occurred_at: now,
        created_at: now,
        product_name: p.name,
      })),
      customers: seedCustomers,
      credit_entries: [],
      sync_outbox: [],
      daily_summaries: [],
    };
  }

  private broadcastChannel: BroadcastChannel | null = null;

  private getBroadcastChannel(): BroadcastChannel | null {
    if (typeof window === 'undefined') return null;
    if (!this.broadcastChannel && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('tindahalin_multi_tab_sync');
    }
    return this.broadcastChannel;
  }

  private notifyTabs(action: string = 'DB_MUTATED') {
    try {
      const channel = this.getBroadcastChannel();
      if (channel) {
        channel.postMessage({ type: 'SYNC_UPDATE', action, timestamp: Date.now() });
      }
    } catch (err) {
      // Ignore channel errors if unsupported
    }
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined' && this.state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notifyTabs();
    }
  }

  // --- OUTBOX & SYNC ---
  public async getSyncOutbox(): Promise<SyncOutbox[]> {
    await this.init();
    return [...(this.state!.sync_outbox || [])];
  }

  public async getPendingOutboxCount(): Promise<number> {
    await this.init();
    return (this.state!.sync_outbox || []).filter((o) => !o.synced_at).length;
  }

  public async flushSyncOutbox(): Promise<number> {
    await this.init();
    const now = new Date().toISOString();
    let count = 0;
    this.state!.sync_outbox = (this.state!.sync_outbox || []).map((o) => {
      if (!o.synced_at) {
        count++;
        return { ...o, synced_at: now };
      }
      return o;
    });
    this.saveToStorage();
    return count;
  }

  // --- STORE ---
  public async getStore(): Promise<Store> {
    await this.init();
    return this.state!.store;
  }

  public async updateStore(partial: Partial<Store>): Promise<Store> {
    await this.init();
    this.state!.store = {
      ...this.state!.store,
      ...partial,
      updated_at: new Date().toISOString(),
    };
    this.saveToStorage();
    return this.state!.store;
  }

  // --- PRODUCTS ---
  public async getProducts(): Promise<Product[]> {
    await this.init();
    return [...this.state!.products];
  }

  public async getProductById(id: string): Promise<Product | null> {
    await this.init();
    return this.state!.products.find((p) => p.id === id) || null;
  }

  public async saveProduct(product: Partial<Product> & { name: string; price_centavos: number }): Promise<Product> {
    await this.init();
    const now = new Date().toISOString();
    let existing = this.state!.products.find((p) => p.id === product.id);

    if (existing) {
      existing = {
        ...existing,
        ...product,
        updated_at: now,
        version: existing.version + 1,
      };
      const index = this.state!.products.findIndex((p) => p.id === product.id);
      this.state!.products[index] = existing;
    } else {
      const newProd: Product = {
        id: product.id || `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        store_id: this.state!.store.id,
        sku: product.sku || null,
        barcode: product.barcode || null,
        name: product.name,
        category: product.category || 'general',
        base_unit: product.base_unit || 'piece',
        item_type: product.item_type || 'retail',
        cost_centavos: product.cost_centavos ?? null,
        price_centavos: product.price_centavos,
        stock_qty_milli: product.stock_qty_milli ?? 0,
        low_stock_qty_milli: product.low_stock_qty_milli ?? 5000,
        is_active: 1,
        created_at: now,
        updated_at: now,
        version: 1,
        is_favorite: product.is_favorite ?? false,
        is_sold_out: product.is_sold_out ?? false,
        prepared_qty_milli: product.prepared_qty_milli ?? 0,
      };
      this.state!.products.unshift(newProd);
      existing = newProd;

      // Add opening movement if initial stock > 0
      if (newProd.stock_qty_milli > 0) {
        this.state!.inventory_movements.unshift({
          id: `mov-new-${newProd.id}`,
          store_id: this.state!.store.id,
          product_id: newProd.id,
          movement_type: 'opening',
          qty_delta_milli: newProd.stock_qty_milli,
          unit_cost_centavos: newProd.cost_centavos,
          sale_id: null,
          reason: 'Initial product stock creation',
          occurred_at: now,
          created_at: now,
          product_name: newProd.name,
        });
      }
    }

    this.saveToStorage();
    return existing;
  }

  // --- SALES & ATOMIC USE CASES ---
  public async getSales(): Promise<Sale[]> {
    await this.init();
    return [...this.state!.sales].sort((a, b) => b.sold_at.localeCompare(a.sold_at));
  }

  /**
   * ATOMIC TRANSACTION: Complete Sale
   * 1. Inserts sale header
   * 2. Inserts sale items
   * 3. Inserts payment record
   * 4. Decrements stock & inserts negative inventory movements
   * 5. Enqueues to sync outbox
   */
  public async executeCompleteSale(params: {
    cartItems: CartItem[];
    subtotalCentavos: number;
    discountCentavos: number;
    totalCentavos: number;
    paymentMethod: PaymentMethod;
    amountReceivedCentavos: number;
    customerId?: string | null;
    referenceSuffix?: string | null;
    cashierName?: string;
  }): Promise<Sale> {
    await this.init();
    const now = new Date().toISOString();
    const saleId = `sale-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const saleNumber = `INV-${String(this.state!.sales.length + 1).padStart(5, '0')}`;

    // 1. Prepare Sale Header
    const newSale: Sale = {
      id: saleId,
      store_id: this.state!.store.id,
      sale_number: saleNumber,
      status: 'completed',
      subtotal_centavos: params.subtotalCentavos,
      discount_centavos: params.discountCentavos,
      total_centavos: params.totalCentavos,
      customer_id: params.customerId || null,
      cashier_name: params.cashierName || 'Owner / Cashier',
      sold_at: now,
      closed_day: null,
      created_at: now,
      items: [],
      payments: [],
    };

    // 2. Prepare Sale Items & Deduct Stock
    const saleItems: SaleItem[] = [];
    const newMovements: InventoryMovement[] = [];

    for (const item of params.cartItems) {
      const saleItemId = `sitem-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const sItem: SaleItem = {
        id: saleItemId,
        sale_id: saleId,
        product_id: item.product.id,
        product_name_snapshot: item.product.name,
        unit_snapshot: item.selected_unit_label || item.product.base_unit,
        qty_milli: item.qty_milli,
        unit_price_centavos: item.unit_price_centavos,
        unit_cost_centavos: item.product.cost_centavos,
        line_total_centavos: item.line_total_centavos,
      };
      saleItems.push(sItem);

      // Inventory movement (negative delta)
      const mov: InventoryMovement = {
        id: `mov-sale-${saleItemId}`,
        store_id: this.state!.store.id,
        product_id: item.product.id,
        movement_type: 'sale',
        qty_delta_milli: -item.qty_milli,
        unit_cost_centavos: item.product.cost_centavos,
        sale_id: saleId,
        reason: `Completed Sale #${saleNumber}`,
        occurred_at: now,
        created_at: now,
        product_name: item.product.name,
      };
      newMovements.push(mov);

      // Decrement stock in cached product table
      const prodIndex = this.state!.products.findIndex((p) => p.id === item.product.id);
      if (prodIndex !== -1) {
        const prod = this.state!.products[prodIndex];
        const newStock = prod.stock_qty_milli - item.qty_milli;
        this.state!.products[prodIndex] = {
          ...prod,
          stock_qty_milli: newStock,
          is_sold_out: prod.item_type === 'dish' && newStock <= 0 ? true : prod.is_sold_out,
          updated_at: now,
        };
      }
    }

    // 3. Prepare Payment Record
    const paymentStatus: PaymentStatus =
      params.paymentMethod === 'qrph'
        ? params.referenceSuffix
          ? 'merchant_confirmed'
          : 'pending'
        : 'merchant_confirmed';

    const newPayment: Payment = {
      id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sale_id: saleId,
      method: params.paymentMethod,
      provider: params.paymentMethod === 'qrph' ? this.state!.store.qr_provider || 'QR Ph' : null,
      amount_centavos: params.totalCentavos,
      status: paymentStatus,
      reference_suffix: params.referenceSuffix || null,
      verification_source: params.paymentMethod === 'qrph' ? 'merchant_manual' : 'cash_drawer',
      paid_at: paymentStatus === 'merchant_confirmed' ? now : null,
      created_at: now,
    };

    // 4. Handle Utang / Customer Credit Entry if Credit payment method
    if (params.paymentMethod === 'credit' && params.customerId) {
      const custIndex = this.state!.customers.findIndex((c) => c.id === params.customerId);
      if (custIndex !== -1) {
        const cust = this.state!.customers[custIndex];
        const currentBal = cust.current_balance_centavos || 0;
        const newBal = currentBal + params.totalCentavos;
        this.state!.customers[custIndex] = {
          ...cust,
          current_balance_centavos: newBal,
          updated_at: now,
        };

        this.state!.credit_entries.unshift({
          id: `cred-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          customer_id: params.customerId,
          sale_id: saleId,
          entry_type: 'charge',
          amount_centavos: params.totalCentavos,
          note: `Purchase on Utang Sale #${saleNumber}`,
          occurred_at: now,
        });
      }
    }

    // 5. Append to State
    newSale.items = saleItems;
    newSale.payments = [newPayment];

    this.state!.sales.unshift(newSale);
    this.state!.sale_items.unshift(...saleItems);
    this.state!.payments.unshift(newPayment);
    this.state!.inventory_movements.unshift(...newMovements);

    // 6. Sync Outbox record
    this.state!.sync_outbox.unshift({
      id: `outbox-${Date.now()}`,
      entity_type: 'sale',
      entity_id: saleId,
      operation: 'INSERT',
      payload_json: JSON.stringify(newSale),
      idempotency_key: `idemp-sale-${saleId}`,
      attempt_count: 0,
      created_at: now,
      synced_at: null,
    });

    this.saveToStorage();
    return newSale;
  }

  // --- STOCK IN & ADJUSTMENTS ---
  public async receiveStock(productId: string, qtyMilli: number, unitCostCentavos: number | null, reason: string): Promise<void> {
    await this.init();
    const now = new Date().toISOString();
    const prodIndex = this.state!.products.findIndex((p) => p.id === productId);
    if (prodIndex === -1) return;

    const prod = this.state!.products[prodIndex];
    const newStock = prod.stock_qty_milli + qtyMilli;

    this.state!.products[prodIndex] = {
      ...prod,
      stock_qty_milli: newStock,
      cost_centavos: unitCostCentavos ?? prod.cost_centavos,
      is_sold_out: newStock <= 0,
      updated_at: now,
    };

    this.state!.inventory_movements.unshift({
      id: `mov-in-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      store_id: this.state!.store.id,
      product_id: productId,
      movement_type: 'stock_in',
      qty_delta_milli: qtyMilli,
      unit_cost_centavos: unitCostCentavos,
      sale_id: null,
      reason: reason || 'Stock-In / Restock',
      occurred_at: now,
      created_at: now,
      product_name: prod.name,
    });

    this.saveToStorage();
  }

  public async recordWaste(productId: string, qtyMilli: number, reason: string): Promise<void> {
    await this.init();
    const now = new Date().toISOString();
    const prodIndex = this.state!.products.findIndex((p) => p.id === productId);
    if (prodIndex === -1) return;

    const prod = this.state!.products[prodIndex];
    const newStock = Math.max(0, prod.stock_qty_milli - qtyMilli);

    this.state!.products[prodIndex] = {
      ...prod,
      stock_qty_milli: newStock,
      is_sold_out: prod.item_type === 'dish' && newStock <= 0 ? true : prod.is_sold_out,
      updated_at: now,
    };

    this.state!.inventory_movements.unshift({
      id: `mov-waste-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      store_id: this.state!.store.id,
      product_id: productId,
      movement_type: 'waste',
      qty_delta_milli: -qtyMilli,
      unit_cost_centavos: prod.cost_centavos,
      sale_id: null,
      reason: reason || 'Spoilage / Leftover Discard',
      occurred_at: now,
      created_at: now,
      product_name: prod.name,
    });

    this.saveToStorage();
  }

  // --- CUSTOMERS & UTANG ---
  public async getCustomers(): Promise<Customer[]> {
    await this.init();
    return [...this.state!.customers];
  }

  public async saveCustomer(name: string, phone?: string, notes?: string): Promise<Customer> {
    await this.init();
    const now = new Date().toISOString();
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      store_id: this.state!.store.id,
      display_name: name,
      phone: phone || null,
      notes: notes || null,
      is_active: 1,
      created_at: now,
      updated_at: now,
      current_balance_centavos: 0,
    };
    this.state!.customers.unshift(newCust);
    this.saveToStorage();
    return newCust;
  }

  public async recordCreditPayment(customerId: string, amountCentavos: number, note: string): Promise<void> {
    await this.init();
    const now = new Date().toISOString();
    const custIndex = this.state!.customers.findIndex((c) => c.id === customerId);
    if (custIndex === -1) return;

    const cust = this.state!.customers[custIndex];
    const newBal = Math.max(0, (cust.current_balance_centavos || 0) - amountCentavos);

    this.state!.customers[custIndex] = {
      ...cust,
      current_balance_centavos: newBal,
      updated_at: now,
    };

    this.state!.credit_entries.unshift({
      id: `cred-pay-${Date.now()}`,
      customer_id: customerId,
      sale_id: null,
      entry_type: 'payment',
      amount_centavos: amountCentavos,
      note: note || 'Utang Payment Received',
      occurred_at: now,
    });

    this.saveToStorage();
  }

  public async getCreditEntries(): Promise<CreditEntry[]> {
    await this.init();
    return [...this.state!.credit_entries];
  }

  public async getInventoryMovements(limit?: number): Promise<InventoryMovement[]> {
    await this.init();
    const movements = [...this.state!.inventory_movements];
    return limit ? movements.slice(0, limit) : movements;
  }

  // --- DAILY DASHBOARD REPORT ---
  public async getDailySummary(dateString?: string): Promise<DailySummary> {
    await this.init();
    const targetDate = dateString || new Date().toISOString().split('T')[0];

    const todaySales = this.state!.sales.filter(
      (s) => s.sold_at.startsWith(targetDate) && s.status === 'completed'
    );

    let grossCentavos = 0;
    let cashCentavos = 0;
    let qrphCentavos = 0;
    let creditCentavos = 0;
    let costCentavos = 0;
    let pendingQr = 0;

    for (const sale of todaySales) {
      grossCentavos += sale.total_centavos;

      const items = this.state!.sale_items.filter((si) => si.sale_id === sale.id);
      for (const item of items) {
        costCentavos += (item.unit_cost_centavos || 0) * (item.qty_milli / 1000);
      }

      const payments = this.state!.payments.filter((p) => p.sale_id === sale.id);
      for (const p of payments) {
        if (p.method === 'cash') cashCentavos += p.amount_centavos;
        else if (p.method === 'qrph') {
          qrphCentavos += p.amount_centavos;
          if (p.status === 'pending') pendingQr++;
        } else if (p.method === 'credit') creditCentavos += p.amount_centavos;
      }
    }

    const lowStockCount = this.state!.products.filter(
      (p) => p.is_active === 1 && p.stock_qty_milli <= (p.low_stock_qty_milli ?? 5000)
    ).length;

    return {
      date: targetDate,
      total_gross_centavos: grossCentavos,
      cash_centavos: cashCentavos,
      qrph_centavos: qrphCentavos,
      credit_centavos: creditCentavos,
      estimated_cost_centavos: Math.round(costCentavos),
      estimated_gross_margin_centavos: Math.max(0, grossCentavos - Math.round(costCentavos)),
      transaction_count: todaySales.length,
      pending_qr_count: pendingQr,
      low_stock_count: lowStockCount,
    };
  }

  // --- BACKUP & RESTORE ---
  public async exportJSON(): Promise<string> {
    await this.init();
    return JSON.stringify(this.state, null, 2);
  }

  public async importJSON(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.store && Array.isArray(parsed.products) && Array.isArray(parsed.sales)) {
        this.state = parsed;
        this.saveToStorage();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }

  public async getStoreConfig(): Promise<StoreConfig> {
    await this.init();
    return {
      store_name: this.state!.store.name,
      address: this.state!.store.tax_profile || 'Brgy. San Jose, Pasig City',
      phone: '0917-555-0199',
      qrph_account_name: this.state!.store.qr_merchant_name || undefined,
      qrph_number: '0917-555-0199',
    };
  }

  public async saveStoreConfig(updated: Partial<StoreConfig>): Promise<void> {
    await this.init();
    if (updated.store_name) this.state!.store.name = updated.store_name;
    if (updated.address) this.state!.store.tax_profile = updated.address;
    if (updated.qrph_account_name) this.state!.store.qr_merchant_name = updated.qrph_account_name;
    this.saveToStorage();
  }

  public async getTodaySummary(): Promise<DailySummary> {
    return this.getDailySummary();
  }

  public async closeDay(date: string, cashCountCentavos: number, notes: string): Promise<DailySummary> {
    const summary = await this.getDailySummary(date);
    return {
      ...summary,
      cash_count_centavos: cashCountCentavos,
      variance_centavos: cashCountCentavos - summary.cash_centavos,
      closing_notes: notes,
      closed_at: new Date().toISOString(),
    };
  }

  public async recordSale(
    items: Array<{ product_id: string; quantity: number; price_centavos: number }>,
    paymentMethod: 'cash' | 'qrph' | 'credit',
    amountPaidCentavos: number,
    customerId?: string,
    customDesc?: string
  ): Promise<Sale> {
    await this.init();
    const cartItems: CartItem[] = [];
    let subtotal = 0;

    for (const it of items) {
      const prod = this.state!.products.find((p) => p.id === it.product_id);
      if (prod) {
        const lineTotal = it.price_centavos * it.quantity;
        subtotal += lineTotal;
        cartItems.push({
          product: prod,
          qty_milli: it.quantity * 1000,
          unit_price_centavos: it.price_centavos,
          line_total_centavos: lineTotal,
        });
      }
    }

    if (cartItems.length === 0 && customDesc) {
      const dummyProd: Product = {
        id: 'prod_custom',
        store_id: this.state!.store.id,
        sku: null,
        barcode: null,
        name: customDesc,
        category: 'general',
        base_unit: 'piece',
        item_type: 'retail',
        cost_centavos: null,
        price_centavos: amountPaidCentavos,
        stock_qty_milli: 999000,
        low_stock_qty_milli: 0,
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
      };
      cartItems.push({
        product: dummyProd,
        qty_milli: 1000,
        unit_price_centavos: amountPaidCentavos,
        line_total_centavos: amountPaidCentavos,
      });
      subtotal = amountPaidCentavos;
    }

    return this.executeCompleteSale({
      cartItems,
      subtotalCentavos: subtotal,
      discountCentavos: 0,
      totalCentavos: subtotal,
      paymentMethod: paymentMethod as PaymentMethod,
      amountReceivedCentavos: amountPaidCentavos,
      customerId,
    });
  }

  // Dexie compatibility proxies
  public get products() {
    const self = this;
    return {
      async toArray(): Promise<Product[]> {
        return self.getProducts();
      },
      async get(id: string): Promise<Product | undefined> {
        const p = await self.getProductById(id);
        return p || undefined;
      },
      async delete(id: string): Promise<void> {
        await self.init();
        self.state!.products = self.state!.products.filter((p) => p.id !== id);
        self.saveToStorage();
      },
      async put(prod: Product): Promise<void> {
        await self.saveProduct(prod);
      },
      async add(prod: Product): Promise<void> {
        await self.saveProduct(prod);
      },
      async update(id: string, partial: Partial<Product>): Promise<void> {
        await self.saveProduct({ id, name: partial.name || '', price_centavos: partial.price_centavos || 0, ...partial });
      },
    };
  }

  public get categories() {
    return {
      async toArray(): Promise<Category[]> {
        return [
          { id: 'all', name: 'All Items', icon: 'ShoppingBag' },
          { id: 'canned', name: 'Canned & Goods', icon: 'Package' },
          { id: 'noodles', name: 'Noodles & Instant', icon: 'Flame' },
          { id: 'drinks', name: 'Beverages', icon: 'Coffee' },
          { id: 'snacks', name: 'Snacks & Chips', icon: 'Sparkles' },
          { id: 'dishes', name: 'Carinderia Dishes', icon: 'Utensils' },
        ];
      },
    };
  }

  public get customers() {
    const self = this;
    return {
      async toArray(): Promise<Customer[]> {
        return self.getCustomers();
      },
      async add(cust: Customer): Promise<void> {
        await self.saveCustomer(cust.display_name, cust.phone || undefined, cust.notes || undefined);
      },
    };
  }

  public get sales() {
    const self = this;
    return {
      async toArray(): Promise<Sale[]> {
        return self.getSales();
      },
    };
  }

  public get inventory_movements() {
    const self = this;
    return {
      async add(mov: InventoryMovement): Promise<void> {
        await self.init();
        self.state!.inventory_movements.unshift(mov);
        self.saveToStorage();
      },
    };
  }

  // --- MONTHLY SALES ROLLUP & ARCHIVING ---
  public async archiveOldSales(
    monthsToKeep: number = 3
  ): Promise<{ archivedCount: number; totalGrossCentavos: number }> {
    await this.init();
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsToKeep);
    const cutoffIso = cutoffDate.toISOString();

    const oldSales = (this.state!.sales || []).filter(
      (s) => (s.sold_at || s.created_at) < cutoffIso && s.status === 'completed'
    );

    if (oldSales.length === 0) {
      return { archivedCount: 0, totalGrossCentavos: 0 };
    }

    const totalGross = oldSales.reduce((acc, s) => acc + s.total_centavos, 0);

    // Group old sales by month key (e.g. "2026-05") to create/update monthly rollup records in daily_summaries
    const monthGroups: Record<
      string,
      { gross: number; cash: number; qr: number; credit: number; count: number }
    > = {};

    for (const s of oldSales) {
      const monthKey = (s.sold_at || s.created_at).slice(0, 7) + '-MONTHLY-ROLLUP';
      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = { gross: 0, cash: 0, qr: 0, credit: 0, count: 0 };
      }
      monthGroups[monthKey].gross += s.total_centavos;
      monthGroups[monthKey].count += 1;
      if (s.payments) {
        for (const p of s.payments) {
          if (p.method === 'cash') monthGroups[monthKey].cash += p.amount_centavos;
          else if (p.method === 'qrph') monthGroups[monthKey].qr += p.amount_centavos;
          else if (p.method === 'credit') monthGroups[monthKey].credit += p.amount_centavos;
        }
      }
    }

    // Merge into daily_summaries as historical monthly rollups
    if (!this.state!.daily_summaries) {
      this.state!.daily_summaries = [];
    }

    for (const [monthKey, data] of Object.entries(monthGroups)) {
      const existingIdx = this.state!.daily_summaries.findIndex((d) => d.date === monthKey);
      const summary: DailySummary = {
        date: monthKey,
        total_gross_centavos: data.gross,
        cash_centavos: data.cash,
        qrph_centavos: data.qr,
        credit_centavos: data.credit,
        estimated_cost_centavos: Math.round(data.gross * 0.7),
        estimated_gross_margin_centavos: Math.round(data.gross * 0.3),
        transaction_count: data.count,
        pending_qr_count: 0,
        low_stock_count: 0,
        closing_notes: `Archived Monthly Sales Summary (${monthKey})`,
        closed_at: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        this.state!.daily_summaries[existingIdx] = summary;
      } else {
        this.state!.daily_summaries.push(summary);
      }
    }

    // Remove individual old sales & sale_items to compact storage
    const oldSaleIds = new Set(oldSales.map((s) => s.id));
    this.state!.sales = (this.state!.sales || []).filter((s) => !oldSaleIds.has(s.id));
    this.state!.sale_items = (this.state!.sale_items || []).filter(
      (si) => !oldSaleIds.has(si.sale_id)
    );

    this.saveToStorage();
    return { archivedCount: oldSales.length, totalGrossCentavos: totalGross };
  }
}

export const db = DatabaseService.getInstance();

export async function initializeDefaultData(): Promise<void> {
  await db.init();
}

export async function exportFullBackup(): Promise<string> {
  return db.exportJSON();
}

export async function importFullBackup(jsonString: string): Promise<boolean> {
  return db.importJSON(jsonString);
}
