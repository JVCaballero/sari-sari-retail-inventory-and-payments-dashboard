'use client';

import React, { useState, useMemo } from 'react';
import { Product, CartItem, PaymentMethod, Customer } from '@/lib/types/domain';
import { useI18n } from '@/lib/i18n/context';
import { formatCentavos, calculateCartTotals, calculateChange } from '@/lib/utils/currency';
import { formatMilliQty, milliToQty, qtyToMilli, UNIT_OPTIONS } from '@/lib/utils/units';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Star,
  CheckCircle2,
  QrCode,
  Banknote,
  UserCheck,
  X,
  ShoppingBag,
  Scan,
  Printer,
} from 'lucide-react';
import { BarcodeScannerModal } from '@/components/common/BarcodeScannerModal';
import { ReceiptModal } from '@/components/common/ReceiptModal';
import { Sale } from '@/lib/types/domain';

interface SellScreenProps {
  products: Product[];
  customers: Customer[];
  qrImageUrl?: string;
  qrMerchantName?: string;
  onCompleteSale: (params: {
    cartItems: CartItem[];
    subtotalCentavos: number;
    discountCentavos: number;
    totalCentavos: number;
    paymentMethod: PaymentMethod;
    amountReceivedCentavos: number;
    customerId?: string | null;
    referenceSuffix?: string | null;
  }) => Promise<void>;
}

export function SellScreen({
  products,
  customers,
  qrImageUrl,
  qrMerchantName,
  onCompleteSale,
}: SellScreenProps) {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashAmountInput, setCashAmountInput] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [refSuffix, setRefSuffix] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const handleBarcodeScanned = (barcode: string) => {
    setShowScanner(false);
    const found = products.find(
      (p) => (p.barcode && p.barcode === barcode) || p.id === barcode
    );
    if (found) {
      addToCart(found);
      setSuccessBanner(`Added "${found.name}" to cart via camera barcode scan!`);
      setTimeout(() => setSuccessBanner(null), 3000);
    } else {
      setSearchTerm(barcode);
    }
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.is_active === 0) return false;
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchTerm));
      const matchesCategory =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'favorites'
          ? p.is_favorite
          : p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        const item = updated[existingIndex];
        const newQtyMilli = item.qty_milli + 1000;
        const newTotal = Math.round((newQtyMilli / 1000) * item.unit_price_centavos);
        updated[existingIndex] = {
          ...item,
          qty_milli: newQtyMilli,
          line_total_centavos: newTotal,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            qty_milli: 1000, // 1.000 unit
            unit_price_centavos: product.price_centavos,
            line_total_centavos: product.price_centavos,
            selected_unit_label: product.base_unit,
            unit_conversion_factor: 1,
          },
        ];
      }
    });
  };

  const updateCartItemQty = (productId: string, deltaMilli: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = Math.max(0, item.qty_milli + deltaMilli);
            if (newQty === 0) return null;
            const newTotal = Math.round((newQty / 1000) * item.unit_price_centavos);
            return {
              ...item,
              qty_milli: newQty,
              line_total_centavos: newTotal,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const totals = useMemo(() => calculateCartTotals(cart), [cart]);

  const cashReceivedCentavos = useMemo(() => {
    const num = parseFloat(cashAmountInput);
    if (isNaN(num)) return 0;
    return Math.round(num * 100);
  }, [cashAmountInput]);

  const changeCentavos = useMemo(() => {
    return calculateChange(cashReceivedCentavos, totals.totalCentavos);
  }, [cashReceivedCentavos, totals.totalCentavos]);

  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const saleAmount = totals.totalCentavos;
    const paidAmount = paymentMethod === 'cash' ? cashReceivedCentavos || saleAmount : saleAmount;

    const newSaleObj: Sale = {
      id: `sale-${Date.now()}`,
      store_id: 'default-store',
      sale_number: `SL-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'completed',
      subtotal_centavos: totals.subtotalCentavos,
      discount_centavos: totals.discountCentavos,
      total_centavos: totals.totalCentavos,
      customer_id: paymentMethod === 'credit' ? selectedCustomerId : null,
      cashier_name: null,
      closed_day: null,
      sold_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      items: cart.map((c) => ({
        id: `si-${Date.now()}-${c.product.id}`,
        sale_id: `sale-${Date.now()}`,
        product_id: c.product.id,
        qty_milli: c.qty_milli,
        unit_price_centavos: c.unit_price_centavos,
        unit_cost_centavos: c.product.cost_centavos || null,
        line_total_centavos: c.line_total_centavos,
        product_name_snapshot: c.product.name,
        unit_snapshot: c.product.base_unit,
      })),
      payments: [
        {
          id: `pay-${Date.now()}`,
          sale_id: `sale-${Date.now()}`,
          method: paymentMethod,
          provider: paymentMethod === 'qrph' ? 'QR Ph' : null,
          amount_centavos: paidAmount,
          status: 'merchant_confirmed',
          reference_suffix: refSuffix || null,
          verification_source: null,
          paid_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ],
    };

    try {
      await onCompleteSale({
        cartItems: cart,
        subtotalCentavos: totals.subtotalCentavos,
        discountCentavos: totals.discountCentavos,
        totalCentavos: totals.totalCentavos,
        paymentMethod,
        amountReceivedCentavos: paidAmount,
        customerId: paymentMethod === 'credit' ? selectedCustomerId : null,
        referenceSuffix: paymentMethod === 'qrph' ? refSuffix : null,
      });

      setCompletedSale(newSaleObj);
      setSuccessBanner(
        `Sale Completed! ${formatCentavos(saleAmount)} - ${
          paymentMethod === 'cash' ? `Change: ${formatCentavos(changeCentavos)}` : 'Recorded'
        }`
      );
      setCart([]);
      setShowCheckout(false);
      setCashAmountInput('');
      setRefSuffix('');
      setSelectedCustomerId('');

      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err) {
      console.error('Failed to complete sale', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 pt-2 max-w-7xl mx-auto px-2 md:px-4">
      {/* Success Notification */}
      {successBanner && (
        <div className="mb-3 bg-emerald-600 text-slate-950 font-bold px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-slate-950" />
            <span>{successBanner}</span>
          </div>
          <div className="flex items-center gap-2">
            {completedSale && (
              <button
                onClick={() => setCompletedSale(completedSale)}
                className="bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-black font-mono flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            )}
            <button onClick={() => setSuccessBanner(null)} className="text-slate-950 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-jakarta">
        {/* LEFT COLUMN: Catalog & Search (8 cols on desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          {/* Search bar with Camera Scanner */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 bg-[#181d2a] border border-slate-800/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#22c55e] font-sub"
              />
            </div>
            <button
              onClick={() => setShowScanner(true)}
              className="bg-[#181d2a] hover:bg-[#222938] text-[#22c55e] border border-slate-800/80 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition font-sub shadow-sm"
              title="Scan Barcode via Camera"
            >
              <Scan className="w-4 h-4 text-[#22c55e]" />
              <span className="hidden sm:inline">Scan Barcode</span>
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-sub">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-[#22c55e] text-slate-950 shadow-sm'
                  : 'bg-[#181d2a] text-slate-300 hover:bg-[#222938] border border-slate-800/80'
              }`}
            >
              {t.allCategories}
            </button>
            <button
              onClick={() => setSelectedCategory('favorites')}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                selectedCategory === 'favorites'
                  ? 'bg-[#22c55e] text-slate-950 shadow-sm'
                  : 'bg-[#181d2a] text-slate-300 hover:bg-[#222938] border border-slate-800/80'
              }`}
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {t.favorites}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap capitalize transition ${
                  selectedCategory === cat
                    ? 'bg-[#22c55e] text-slate-950 shadow-sm'
                    : 'bg-[#181d2a] text-slate-300 hover:bg-[#222938] border border-slate-800/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2.5">
            {filteredProducts.map((product) => {
              const cartItem = cart.find((i) => i.product.id === product.id);
              const isOut = product.stock_qty_milli <= 0 || product.is_sold_out;

              return (
                <div
                  key={product.id}
                  onClick={() => !isOut && addToCart(product)}
                  className={`bg-[#181d2a] border rounded-xl p-3 flex flex-col justify-between cursor-pointer transition select-none relative shadow-sm hover:shadow-md ${
                    isOut
                      ? 'border-red-900/50 opacity-60 bg-[#121620]'
                      : cartItem
                      ? 'border-[#22c55e] ring-1 ring-[#22c55e]/50 bg-[#181d2a]'
                      : 'border-slate-800/80 hover:border-slate-700 bg-[#181d2a]'
                  }`}
                >
                  {/* Category & favorite tag */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="capitalize bg-[#121620] px-1.5 py-0.5 rounded text-slate-300 font-sub font-medium">
                      {product.category}
                    </span>
                    {product.is_favorite && (
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="font-extrabold text-xs text-white line-clamp-2 mb-2 leading-tight font-jakarta">
                    {product.name}
                  </h3>

                  {/* Stock & Price */}
                  <div className="mt-auto flex items-end justify-between pt-1 border-t border-slate-800/80">
                    <div>
                      <span className="text-[10px] block text-slate-400 font-sub font-normal">
                        {isOut ? (
                          <span className="text-red-400 font-semibold">{t.soldOut}</span>
                        ) : (
                          <span>Stock: {formatMilliQty(product.stock_qty_milli, product.base_unit)}</span>
                        )}
                      </span>
                      <span className="text-sm font-extrabold text-[#22c55e] font-jakarta">
                        {formatCentavos(product.price_centavos)}
                      </span>
                    </div>

                    {cartItem ? (
                      <div className="bg-[#22c55e] text-slate-950 font-black text-xs px-2 py-1 rounded-lg font-jakarta">
                        {milliToQty(cartItem.qty_milli)}
                      </div>
                    ) : (
                      <button
                        disabled={isOut}
                        className="p-1.5 bg-[#121620] hover:bg-[#22c55e] hover:text-slate-950 text-slate-300 rounded-lg transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Cart & Checkout Summary (4-5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-[#181d2a] border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between min-h-[420px] shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 mb-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#22c55e]" />
                <h2 className="font-extrabold text-sm text-white font-jakarta">{t.newSale}</h2>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition font-sub"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t.clearCart}
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2 font-sub">
                <ShoppingBag className="w-10 h-10 mx-auto text-slate-700" />
                <p className="text-xs font-normal">Cart is empty. Tap items to add.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-[#121620] p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate font-jakarta">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-sub font-medium">
                        {formatCentavos(item.unit_price_centavos)} / {item.selected_unit_label}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#181d2a] border border-slate-800/80 rounded-lg p-1">
                      <button
                        onClick={() => updateCartItemQty(item.product.id, -1000)}
                        className="p-1 hover:bg-[#222938] text-slate-300 rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-extrabold text-white px-1 font-jakarta">
                        {milliToQty(item.qty_milli)}
                      </span>
                      <button
                        onClick={() => updateCartItemQty(item.product.id, 1000)}
                        className="p-1 hover:bg-[#222938] text-slate-300 rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-extrabold text-[#22c55e] font-jakarta">
                        {formatCentavos(item.line_total_centavos)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer Totals & Checkout Button */}
          <div className="pt-3 border-t border-slate-800/80 mt-2 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-sub font-medium">
              <span>Subtotal:</span>
              <span className="font-semibold text-white font-jakarta">{formatCentavos(totals.subtotalCentavos)}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-extrabold text-white pt-1 border-t border-slate-800/60 font-jakarta">
              <span>TOTAL:</span>
              <span className="text-[#22c55e] text-base">{formatCentavos(totals.totalCentavos)}</span>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={() => setShowCheckout(true)}
              className="w-full py-3 bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-extrabold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2 font-jakarta"
            >
              <span>{t.checkout}</span>
              <span>({formatCentavos(totals.totalCentavos)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-3 font-jakarta">
          <div className="bg-[#181d2a] border border-slate-800/80 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="font-extrabold text-base text-white font-jakarta">{t.checkout}</h3>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Amount Banner */}
            <div className="bg-[#121620] p-3.5 rounded-xl border border-slate-800/80 text-center space-y-0.5">
              <span className="text-xs text-slate-400 font-sub font-medium block">Total Payable Amount</span>
              <span className="text-2xl font-black text-[#22c55e] font-jakarta">
                {formatCentavos(totals.totalCentavos)}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5 font-sub">
              <label className="text-xs font-semibold text-slate-300 block">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2 font-jakarta">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'cash'
                      ? 'bg-[#22c55e]/20 border-[#22c55e] text-[#22c55e] shadow-sm'
                      : 'bg-[#121620] border-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span>{t.cash}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('qrph')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'qrph'
                      ? 'bg-[#22c55e]/20 border-[#22c55e] text-[#22c55e] shadow-sm'
                      : 'bg-[#121620] border-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span>{t.qrph}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'credit'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-[#121620] border-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-5 h-5" />
                  <span>{t.creditUtang}</span>
                </button>
              </div>
            </div>

            {/* CASH FLOW */}
            {paymentMethod === 'cash' && (
              <div className="space-y-2 bg-[#121620] p-3.5 rounded-xl border border-slate-800/80 font-sub">
                <label className="text-xs font-medium text-slate-300 block">{t.amountReceived} (₱)</label>
                <div className="flex gap-2 font-jakarta">
                  <input
                    type="number"
                    step="1"
                    placeholder={(totals.totalCentavos / 100).toString()}
                    value={cashAmountInput}
                    onChange={(e) => setCashAmountInput(e.target.value)}
                    className="flex-1 bg-[#181d2a] border border-slate-800/80 rounded-lg px-3 py-2 text-white font-extrabold text-lg focus:outline-none focus:border-[#22c55e]"
                  />
                  <button
                    onClick={() => setCashAmountInput((totals.totalCentavos / 100).toString())}
                    className="px-3 py-1 bg-[#181d2a] hover:bg-[#222938] border border-slate-800/80 text-slate-200 text-xs font-bold rounded-lg font-sub"
                  >
                    Exact
                  </button>
                </div>

                {/* Change calculation */}
                <div className="flex justify-between items-center text-xs font-sub pt-1">
                  <span className="text-slate-400">{t.change}:</span>
                  <span className="text-base font-black text-amber-400 font-jakarta">
                    {formatCentavos(changeCentavos)}
                  </span>
                </div>
              </div>
            )}

            {/* QR PH FLOW */}
            {paymentMethod === 'qrph' && (
              <div className="space-y-3 bg-[#121620] p-3.5 rounded-xl border border-slate-800/80 text-center font-sub">
                <p className="text-xs text-slate-300 font-semibold">{qrMerchantName || 'Store QR Ph Code'}</p>
                <div className="bg-white p-2 rounded-xl inline-block shadow-sm">
                  <img
                    src={qrImageUrl || 'https://picsum.photos/seed/qrph/300/300'}
                    alt="QR Ph Merchant Code"
                    className="w-40 h-40 object-cover rounded-lg"
                  />
                </div>
                <p className="text-[11px] text-amber-300 font-medium">
                  ⚠️ Verify SMS or provider notification on store phone before clicking complete.
                </p>
                <input
                  type="text"
                  placeholder={t.refSuffix}
                  value={refSuffix}
                  onChange={(e) => setRefSuffix(e.target.value)}
                  className="w-full bg-[#181d2a] border border-slate-800/80 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-sub"
                />
              </div>
            )}

            {/* UTANG / CREDIT FLOW */}
            {paymentMethod === 'credit' && (
              <div className="space-y-2 bg-[#121620] p-3.5 rounded-xl border border-slate-800/80 font-sub">
                <label className="text-xs font-medium text-slate-300 block">Select Customer (Suki)</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-[#181d2a] border border-slate-800/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-sub"
                >
                  <option value="">-- Choose Suki --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.display_name} (Owed: {formatCentavos(c.current_balance_centavos)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Final Action Button */}
            <button
              disabled={isSubmitting || (paymentMethod === 'credit' && !selectedCustomerId)}
              onClick={handleCheckoutSubmit}
              className="w-full py-3 bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2 font-jakarta"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{t.completeSale}</span>
            </button>
          </div>
        </div>
      )}

      {/* Camera Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScannerModal
          onScanSuccess={handleBarcodeScanned}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* ESC/POS Receipt Modal */}
      {completedSale && (
        <ReceiptModal
          sale={completedSale}
          onClose={() => setCompletedSale(null)}
        />
      )}
    </div>
  );
}
