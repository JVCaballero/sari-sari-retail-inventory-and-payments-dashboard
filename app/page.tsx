'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { I18nProvider } from '@/lib/i18n/context';
import { Header } from '@/components/common/Header';
import { Navigation } from '@/components/common/Navigation';
import { SellScreen } from '@/components/sell/SellScreen';
import { ProductsScreen } from '@/components/products/ProductsScreen';
import { InventoryScreen } from '@/components/inventory/InventoryScreen';
import { TodayScreen } from '@/components/today/TodayScreen';
import { UtangLedgerScreen } from '@/components/utang/UtangLedgerScreen';
import { AnalyticsScreen } from '@/components/analytics/AnalyticsScreen';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { UtangModal } from '@/components/utang/UtangModal';
import { PinModal } from '@/components/common/PinModal';

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
  CreditEntry,
  Sale,
  DailySummary,
  StoreConfig,
  InventoryMovement,
  CartItem,
  PaymentMethod,
} from '@/lib/types/domain';

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    'sell' | 'products' | 'inventory' | 'utang' | 'analytics' | 'today'
  >('sell');

  // Domain State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [creditEntries, setCreditEntries] = useState<CreditEntry[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [allSales, setAllSales] = useState<Sale[]>([]);
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

  // Phase 3 Multi-User RBAC & Cloud Sync State
  const [isCashierMode, setIsCashierMode] = useState(false);
  const [pendingOutboxCount, setPendingOutboxCount] = useState(0);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinAction, setPinAction] = useState<'unlock_cashier' | 'open_settings' | 'open_analytics' | null>(null);

  const [isDbReady, setIsDbReady] = useState(false);

  // Load Database State
  const refreshData = useCallback(async () => {
    try {
      await initializeDefaultData();
      const loadedProducts = await db.products.toArray();
      const loadedCategories = await db.categories.toArray();
      const loadedCustomers = await db.customers.toArray();
      const loadedCreditEntries = await db.getCreditEntries();
      const loadedConfig = await db.getStoreConfig();
      const loadedSummary = await db.getTodaySummary();
      const loadedMovements = await db.getInventoryMovements(30);
      const loadedOutboxCount = await db.getPendingOutboxCount();

      const todayStr = new Date().toISOString().split('T')[0];
      const fetchedAllSales = await db.sales.toArray();
      const todaySales = fetchedAllSales
        .filter((s) => s.sold_at.startsWith(todayStr))
        .sort((a, b) => new Date(b.sold_at).getTime() - new Date(a.sold_at).getTime());

      setProducts(loadedProducts);
      setCategories(loadedCategories);
      setCustomers(loadedCustomers);
      setCreditEntries(loadedCreditEntries);
      setConfig(loadedConfig);
      setSummary(loadedSummary);
      setAllSales(fetchedAllSales);
      setRecentSales(todaySales);
      setMovements(loadedMovements);
      setPendingOutboxCount(loadedOutboxCount);
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

    // Multi-Tab Real-Time Sync via BroadcastChannel
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('tindahalin_multi_tab_sync');
      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'SYNC_UPDATE' && mounted) {
          refreshData();
        }
      };
    }

    return () => {
      mounted = false;
      if (channel) {
        channel.close();
      }
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

  const handleCreateCustomer = async (name: string, phone?: string, notes?: string): Promise<Customer> => {
    const created = await db.saveCustomer(name, phone, notes);
    await refreshData();
    return created;
  };

  const handleRecordCreditPayment = async (customerId: string, amountCentavos: number, note: string) => {
    await db.recordCreditPayment(customerId, amountCentavos, note);
    await refreshData();
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

  // Cashier Mode & PIN Authentication Handlers
  const handleToggleCashierMode = () => {
    if (isCashierMode) {
      setPinAction('unlock_cashier');
      setShowPinModal(true);
    } else {
      setIsCashierMode(true);
    }
  };

  const handleOpenSettingsWithCheck = () => {
    if (isCashierMode) {
      setPinAction('open_settings');
      setShowPinModal(true);
    } else {
      setShowSettings(true);
    }
  };

  const handleTabChangeWithCheck = (tab: 'sell' | 'products' | 'inventory' | 'utang' | 'analytics' | 'today') => {
    if (isCashierMode && (tab === 'analytics' || tab === 'inventory')) {
      setPinAction('open_analytics');
      setShowPinModal(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handlePinSuccess = () => {
    setShowPinModal(false);
    if (pinAction === 'unlock_cashier') {
      setIsCashierMode(false);
    } else if (pinAction === 'open_settings') {
      setShowSettings(true);
    } else if (pinAction === 'open_analytics') {
      setActiveTab('analytics');
    }
    setPinAction(null);
  };

  const handleFlushOutbox = async (): Promise<number> => {
    const flushed = await db.flushSyncOutbox();
    await refreshData();
    return flushed;
  };

  const handleArchiveSales = async (
    monthsToKeep: number
  ): Promise<{ archivedCount: number; totalGrossCentavos: number }> => {
    const res = await db.archiveOldSales(monthsToKeep);
    await refreshData();
    return res;
  };

  return (
    <I18nProvider>
      <div className="min-h-screen bg-[#0e1117] text-slate-200 font-sans flex flex-col relative overflow-x-hidden">
        {/* Global System Header */}
        <Header
          storeName={config.store_name}
          address={config.address}
          pendingQrCount={summary?.pending_qr_count || 0}
          pendingOutboxCount={pendingOutboxCount}
          isCashierMode={isCashierMode}
          onToggleCashierMode={handleToggleCashierMode}
          onFlushOutbox={handleFlushOutbox}
          onOpenSettings={handleOpenSettingsWithCheck}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-2 md:px-6 py-4 relative z-10 max-w-7xl mx-auto w-full">
          {!isDbReady ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-emerald-400">Loading Store Database...</p>
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

              {activeTab === 'utang' && (
                <UtangLedgerScreen
                  customers={customers}
                  creditEntries={creditEntries}
                  onRecordPayment={handleRecordCreditPayment}
                  onCreateCustomer={handleCreateCustomer}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsScreen
                  sales={allSales}
                  products={products}
                />
              )}

              {activeTab === 'today' && (
                <TodayScreen
                  summary={summary}
                  recentSales={recentSales}
                  onCloseDay={handleCloseDay}
                  onNavigateToAnalytics={() => handleTabChangeWithCheck('analytics')}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation */}
        <Navigation activeTab={activeTab} setActiveTab={handleTabChangeWithCheck} />

        {/* Owner PIN Authentication Modal */}
        {showPinModal && (
          <PinModal
            correctPin="1234"
            onSuccess={handlePinSuccess}
            onClose={() => {
              setShowPinModal(false);
              setPinAction(null);
            }}
          />
        )}

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
            pendingOutboxCount={pendingOutboxCount}
            onFlushOutbox={handleFlushOutbox}
            onArchiveSales={handleArchiveSales}
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
