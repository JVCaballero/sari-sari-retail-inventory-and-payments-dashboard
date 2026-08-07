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
} from 'lucide-react';

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

    try {
      await onCompleteSale({
        cartItems: cart,
        subtotalCentavos: totals.subtotalCentavos,
        discountCentavos: totals.discountCentavos,
        totalCentavos: totals.totalCentavos,
        paymentMethod,
        amountReceivedCentavos:
          paymentMethod === 'cash' ? cashReceivedCentavos || totals.totalCentavos : totals.totalCentavos,
        customerId: paymentMethod === 'credit' ? selectedCustomerId : null,
        referenceSuffix: paymentMethod === 'qrph' ? refSuffix : null,
      });

      setSuccessBanner(
        `Sale Completed! ${formatCentavos(totals.totalCentavos)} - ${
          paymentMethod === 'cash' ? `Change: ${formatCentavos(changeCentavos)}` : 'Recorded'
        }`
      );
      setCart([]);
      setShowCheckout(false);
      setCashAmountInput('');
      setRefSuffix('');
      setSelectedCustomerId('');

      setTimeout(() => setSuccessBanner(null), 4000);
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
        <div className="mb-3 bg-emerald-600 text-slate-950 font-bold px-4 py-3 rounded-lg shadow-lg flex items-center justify-between text-sm animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-slate-950" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-slate-950 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Catalog & Search (8 cols on desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t.allCategories}
            </button>
            <button
              onClick={() => setSelectedCategory('favorites')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition flex items-center gap-1 ${
                selectedCategory === 'favorites'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {t.favorites}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap capitalize transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
                  className={`bg-slate-900 border rounded-xl p-2.5 flex flex-col justify-between cursor-pointer transition select-none relative ${
                    isOut
                      ? 'border-red-900/50 opacity-60 bg-red-950/10'
                      : cartItem
                      ? 'border-emerald-500 ring-1 ring-emerald-500/50 bg-slate-850'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900'
                  }`}
                >
                  {/* Category & favorite tag */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="capitalize bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">
                      {product.category}
                    </span>
                    {product.is_favorite && (
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="font-semibold text-xs text-white line-clamp-2 mb-2 leading-tight">
                    {product.name}
                  </h3>

                  {/* Stock & Price */}
                  <div className="mt-auto flex items-end justify-between pt-1 border-t border-slate-800">
                    <div>
                      <span className="text-[10px] block text-slate-400">
                        {isOut ? (
                          <span className="text-red-400 font-bold">{t.soldOut}</span>
                        ) : (
                          <span>Stock: {formatMilliQty(product.stock_qty_milli, product.base_unit)}</span>
                        )}
                      </span>
                      <span className="text-sm font-black text-emerald-400">
                        {formatCentavos(product.price_centavos)}
                      </span>
                    </div>

                    {cartItem ? (
                      <div className="bg-emerald-500 text-slate-950 font-black text-xs px-2 py-1 rounded-lg">
                        {milliToQty(cartItem.qty_milli)}
                      </div>
                    ) : (
                      <button
                        disabled={isOut}
                        className="p-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 rounded-lg transition"
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
        <div className="lg:col-span-5 xl:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between min-h-[420px]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <h2 className="font-bold text-sm text-white">{t.newSale}</h2>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t.clearCart}
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <ShoppingBag className="w-10 h-10 mx-auto text-slate-700" />
                <p className="text-xs font-medium">Cart is empty. Tap items to add.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {formatCentavos(item.unit_price_centavos)} / {item.selected_unit_label}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-md p-1">
                      <button
                        onClick={() => updateCartItemQty(item.product.id, -1000)}
                        className="p-1 hover:bg-slate-800 text-slate-300 rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-white px-1 font-mono">
                        {milliToQty(item.qty_milli)}
                      </span>
                      <button
                        onClick={() => updateCartItemQty(item.product.id, 1000)}
                        className="p-1 hover:bg-slate-800 text-slate-300 rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-400">
                        {formatCentavos(item.line_total_centavos)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer Totals & Checkout Button */}
          <div className="pt-3 border-t border-slate-800 mt-2 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
              <span>Subtotal:</span>
              <span>{formatCentavos(totals.subtotalCentavos)}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-black text-white pt-1 border-t border-slate-800/60">
              <span>TOTAL:</span>
              <span className="text-emerald-400 text-base">{formatCentavos(totals.totalCentavos)}</span>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={() => setShowCheckout(true)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2"
            >
              <span>{t.checkout}</span>
              <span>({formatCentavos(totals.totalCentavos)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-base text-white">{t.checkout}</h3>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Amount Banner */}
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
              <span className="text-xs text-slate-400 font-medium block">Total Payable Amount</span>
              <span className="text-2xl font-black text-emerald-400">
                {formatCentavos(totals.totalCentavos)}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'cash'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
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
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
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
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-5 h-5" />
                  <span>{t.creditUtang}</span>
                </button>
              </div>
            </div>

            {/* CASH FLOW */}
            {paymentMethod === 'cash' && (
              <div className="space-y-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <label className="text-xs font-medium text-slate-300 block">{t.amountReceived} (₱)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="1"
                    placeholder={(totals.totalCentavos / 100).toString()}
                    value={cashAmountInput}
                    onChange={(e) => setCashAmountInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold text-lg focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => setCashAmountInput((totals.totalCentavos / 100).toString())}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-lg"
                  >
                    Exact
                  </button>
                </div>

                {/* Change calculation */}
                <div className="flex justify-between items-center text-xs font-mono pt-1">
                  <span className="text-slate-400">{t.change}:</span>
                  <span className="text-base font-black text-amber-400">
                    {formatCentavos(changeCentavos)}
                  </span>
                </div>
              </div>
            )}

            {/* QR PH FLOW */}
            {paymentMethod === 'qrph' && (
              <div className="space-y-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700 text-center">
                <p className="text-xs text-slate-300 font-semibold">{qrMerchantName || 'Store QR Ph Code'}</p>
                <div className="bg-white p-2 rounded-xl inline-block shadow">
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono"
                />
              </div>
            )}

            {/* UTANG / CREDIT FLOW */}
            {paymentMethod === 'credit' && (
              <div className="space-y-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <label className="text-xs font-medium text-slate-300 block">Select Customer (Suki)</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
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
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{t.completeSale}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
