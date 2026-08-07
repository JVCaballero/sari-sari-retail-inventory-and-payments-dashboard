'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { I18nProvider } from '@/lib/i18n/context';
import { Header } from '@/components/common/Header';
import { Navigation } from '@/components/common/Navigation';
import { SellScreen } from '@/components/sell/SellScreen';
import { ProductsScreen } from '@/components/products/ProductsScreen';
import { InventoryScreen } from '@/components/inventory/InventoryScreen';
import { TodayScreen } from '@/components/today/TodayScreen';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { UtangModal } from '@/components/utang/UtangModal';

import {
  db,
  initializeDefaultData,
  exportFullBackup,
  importFullBackup,
} from '@/lib/db/database';

import {
  Product,
  Category,
  Customer,
  Sale,
  DailySummary,
  StoreConfig,
  InventoryMovement,
  CartItem,
  PaymentMethod,
} from '@/lib/types/domain';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'sell' | 'products' | 'inventory' | 'today'>('sell');

  // Domain State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [config, setConfig] = useState<StoreConfig>({
    store_name: 'Aling Nena Store',
    address: 'Brgy. San Jose, Pasig City',
    phone: '0917-555-0199',
  });
  const [movements, setMovements] = useState<InventoryMovement[]>([]);

  // Modals & Triggers
  const [showSettings, setShowSettings] = useState(false);
  const [showUtangModal, setShowUtangModal] = useState(false);
  const [pendingCartTotal, setPendingCartTotal] = useState(0);
  const [onSelectUtangCustomer, setOnSelectUtangCustomer] = useState<((c: Customer) => void) | null>(null);

  const [isDbReady, setIsDbReady] = useState(false);

  // Load Database State
  const refreshData = useCallback(async () => {
    try {
      await initializeDefaultData();
      const loadedProducts = await db.products.toArray();
      const loadedCategories = await db.categories.toArray();
      const loadedCustomers = await db.customers.toArray();
      const loadedConfig = await db.getStoreConfig();
      const loadedSummary = await db.getTodaySummary();
      const loadedMovements = await db.getInventoryMovements(30);

      const todayStr = new Date().toISOString().split('T')[0];
      const allSales = await db.sales.toArray();
      const todaySales = allSales
        .filter((s) => s.sold_at.startsWith(todayStr))
        .sort((a, b) => new Date(b.sold_at).getTime() - new Date(a.sold_at).getTime());

      setProducts(loadedProducts);
      setCategories(loadedCategories);
      setCustomers(loadedCustomers);
      setConfig(loadedConfig);
      setSummary(loadedSummary);
      setRecentSales(todaySales);
      setMovements(loadedMovements);
      setIsDbReady(true);
    } catch (err) {
      console.error('Failed to load database state:', err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mounted) {
        await refreshData();
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [refreshData]);

  // Product & Inventory Handlers
  const handleSaveProduct = async (product: Partial<Product> & { name: string; price_centavos: number }) => {
    await db.saveProduct(product);
    await refreshData();
  };

  const handleRecordWaste = async (productId: string, qtyMilli: number, reason: string) => {
    await db.recordWaste(productId, qtyMilli, reason);
    await refreshData();
  };

  const handleReceiveStock = async (
    productId: string,
    qtyMilli: number,
    unitCostCentavos: number | null,
    reason: string
  ) => {
    await db.receiveStock(productId, qtyMilli, unitCostCentavos, reason);
    await refreshData();
  };

  // Checkout Handler
  const handleCompleteSale = async (params: {
    cartItems: CartItem[];
    subtotalCentavos: number;
    discountCentavos: number;
    totalCentavos: number;
    paymentMethod: PaymentMethod;
    amountReceivedCentavos: number;
    customerId?: string | null;
    referenceSuffix?: string | null;
  }) => {
    await db.executeCompleteSale(params);
    await refreshData();
  };

  // Utang Modal Handler
  const handleOpenUtangModal = (cartTotal: number, onSelect: (c: Customer) => void) => {
    setPendingCartTotal(cartTotal);
    setOnSelectUtangCustomer(() => onSelect);
    setShowUtangModal(true);
  };

  const handleSelectUtangCustomer = (customer: Customer) => {
    if (onSelectUtangCustomer) {
      onSelectUtangCustomer(customer);
    }
    setShowUtangModal(false);
  };

  const handleCreateCustomer = async (name: string, phone?: string): Promise<Customer> => {
    const created = await db.saveCustomer(name, phone);
    await refreshData();
    return created;
  };

  // Close Day Handler
  const handleCloseDay = async (cashCountCentavos: number, notes: string) => {
    if (!summary) return;
    const closed = await db.closeDay(summary.date, cashCountCentavos, notes);
    setSummary(closed);
  };

  // Backup & Restore
  const handleExportBackup = async () => {
    const jsonStr = await exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tindahalin_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = async (jsonString: string): Promise<boolean> => {
    const success = await importFullBackup(jsonString);
    if (success) {
      await refreshData();
    }
    return success;
  };

  const handleUpdateConfig = async (updated: Partial<StoreConfig>) => {
    await db.saveStoreConfig(updated);
    await refreshData();
  };

  return (
    <I18nProvider>
      <div className="min-h-screen bg-[#05060a] text-slate-300 font-sans flex flex-col relative overflow-x-hidden">
        {/* Subtle radial blueprint background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e293b,transparent)] opacity-20 pointer-events-none"></div>

        {/* Global System Header */}
        <Header
          storeName={config.store_name}
          address={config.address}
          pendingQrCount={summary?.pending_qr_count || 0}
          onOpenSettings={() => setShowSettings(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-2 md:px-6 py-3 relative z-10 max-w-7xl mx-auto w-full">
          {!isDbReady ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_10px_#10b981]"></div>
              <p className="text-xs font-mono text-emerald-400">INITIALIZING_OFFLINE_DATABASE...</p>
            </div>
          ) : (
            <>
              {activeTab === 'sell' && (
                <SellScreen
                  products={products}
                  customers={customers}
                  qrImageUrl="https://picsum.photos/seed/qrph/300/300"
                  qrMerchantName={config.qrph_account_name || config.store_name}
                  onCompleteSale={handleCompleteSale}
                />
              )}

              {activeTab === 'products' && (
                <ProductsScreen
                  products={products}
                  onSaveProduct={handleSaveProduct}
                  onRecordWaste={handleRecordWaste}
                />
              )}

              {activeTab === 'inventory' && (
                <InventoryScreen
                  products={products}
                  movements={movements}
                  onReceiveStock={handleReceiveStock}
                />
              )}

              {activeTab === 'today' && (
                <TodayScreen
                  summary={summary}
                  recentSales={recentSales}
                  onCloseDay={handleCloseDay}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation */}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Utang Ledger Modal */}
        {showUtangModal && (
          <UtangModal
            customers={customers}
            cartTotalCentavos={pendingCartTotal}
            onSelectCustomer={handleSelectUtangCustomer}
            onCreateCustomer={handleCreateCustomer}
            onClose={() => setShowUtangModal(false)}
          />
        )}

        {/* Settings Modal */}
        {showSettings && (
          <SettingsModal
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </I18nProvider>
  );
}
