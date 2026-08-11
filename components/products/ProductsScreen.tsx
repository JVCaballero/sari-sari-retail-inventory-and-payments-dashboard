'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types/domain';
import { useI18n } from '@/lib/i18n/context';
import { formatCentavos, parseToCentavos } from '@/lib/utils/currency';
import { formatMilliQty, qtyToMilli, UNIT_OPTIONS } from '@/lib/utils/units';
import {
  Search,
  Plus,
  Utensils,
  Package,
  CheckCircle,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
  Scan,
} from 'lucide-react';
import { BarcodeScannerModal } from '@/components/common/BarcodeScannerModal';

interface ProductsScreenProps {
  products: Product[];
  onSaveProduct: (product: Partial<Product> & { name: string; price_centavos: number }) => Promise<void>;
  onRecordWaste: (productId: string, qtyMilli: number, reason: string) => Promise<void>;
}

export function ProductsScreen({
  products,
  onSaveProduct,
  onRecordWaste,
}: ProductsScreenProps) {
  const { t } = useI18n();
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'carinderia'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategory, setFormCategory] = useState('noodles');
  const [formPrice, setFormPrice] = useState('15.00');
  const [formCost, setFormCost] = useState('11.50');
  const [formUnit, setFormUnit] = useState('piece');
  const [formItemType, setFormItemType] = useState<'retail' | 'dish'>('retail');
  const [formStockQty, setFormStockQty] = useState('20');
  const [formIsFavorite, setFormIsFavorite] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Waste Modal State
  const [wasteProductId, setWasteProductId] = useState<string | null>(null);
  const [wasteQtyInput, setWasteQtyInput] = useState('1');
  const [wasteReason, setWasteReason] = useState('Unsold Leftover');

  const openAddModal = (p?: Product) => {
    if (p) {
      setEditingProduct(p);
      setFormName(p.name);
      setFormBarcode(p.barcode || '');
      setFormCategory(p.category);
      setFormPrice((p.price_centavos / 100).toString());
      setFormCost(p.cost_centavos ? (p.cost_centavos / 100).toString() : '');
      setFormUnit(p.base_unit);
      setFormItemType(p.item_type === 'dish' ? 'dish' : 'retail');
      setFormStockQty((p.stock_qty_milli / 1000).toString());
      setFormIsFavorite(p.is_favorite || false);
    } else {
      setEditingProduct(null);
      setFormName('');
      setFormBarcode('');
      setFormCategory('noodles');
      setFormPrice('15.00');
      setFormCost('11.50');
      setFormUnit('piece');
      setFormItemType('retail');
      setFormStockQty('20');
      setFormIsFavorite(false);
    }
    setShowAddModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    await onSaveProduct({
      id: editingProduct?.id,
      name: formName,
      barcode: formBarcode.trim() || undefined,
      category: formCategory,
      price_centavos: parseToCentavos(formPrice),
      cost_centavos: formCost ? parseToCentavos(formCost) : null,
      base_unit: formUnit,
      item_type: formItemType,
      stock_qty_milli: qtyToMilli(parseFloat(formStockQty) || 0),
      is_favorite: formIsFavorite,
    });

    setShowAddModal(false);
  };

  const handleWasteSubmit = async () => {
    if (!wasteProductId) return;
    const qtyMilli = qtyToMilli(parseFloat(wasteQtyInput) || 1);
    await onRecordWaste(wasteProductId, qtyMilli, wasteReason);
    setWasteProductId(null);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeSubTab === 'carinderia') {
      return matchesSearch && p.item_type === 'dish';
    }
    return matchesSearch;
  });

  return (
    <div className="pb-24 pt-2 max-w-7xl mx-auto px-2 md:px-4 space-y-3 font-jakarta">
      {/* Top Header & Mode Toggle */}
      <div className="bg-[#181d2a] border border-slate-800/80 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 font-sub">
          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeSubTab === 'catalog'
                ? 'bg-[#22c55e] text-slate-950 font-extrabold shadow-sm'
                : 'bg-[#121620] text-slate-300 hover:text-white border border-slate-800/80'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Catalog</span>
          </button>
          <button
            onClick={() => setActiveSubTab('carinderia')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeSubTab === 'carinderia'
                ? 'bg-[#22c55e] text-slate-950 font-extrabold shadow-sm'
                : 'bg-[#121620] text-slate-300 hover:text-white border border-slate-800/80'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>{t.dailyMenu}</span>
          </button>
        </div>

        <button
          onClick={() => openAddModal()}
          className="bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 text-xs font-extrabold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm font-jakarta"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative font-sub">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-9 pr-3 py-2 bg-[#181d2a] border border-slate-800/80 rounded-xl text-sm text-white focus:outline-none focus:border-[#22c55e]"
        />
      </div>

      {/* CARINDERIA DAILY MENU SPECIFIC VIEW */}
      {activeSubTab === 'carinderia' ? (
        <div className="space-y-3 font-jakarta">
          <div className="bg-[#181d2a] border border-slate-800/80 p-3.5 rounded-2xl shadow-sm">
            <h3 className="font-extrabold text-xs text-amber-300 uppercase tracking-wider mb-1 font-jakarta">
              🍲 Today&apos;s Prepared Carinderia Servings
            </h3>
            <p className="text-xs text-slate-400 font-sub font-normal">
              Update prepared morning stock, mark dishes sold-out, or record end-of-day leftovers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProducts.map((dish) => {
              const isOut = dish.stock_qty_milli <= 0 || dish.is_sold_out;
              return (
                <div
                  key={dish.id}
                  className="bg-[#181d2a] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-white leading-tight font-jakarta">{dish.name}</h4>
                      <p className="text-xs text-[#22c55e] font-extrabold mt-0.5 font-jakarta">
                        {formatCentavos(dish.price_centavos)} / {dish.base_unit}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        onSaveProduct({
                          ...dish,
                          is_sold_out: !dish.is_sold_out,
                        })
                      }
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition font-sub ${
                        isOut
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/40'
                      }`}
                    >
                      {isOut ? t.soldOut : 'Available'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-[#121620] p-2.5 rounded-xl border border-slate-800/80 font-sub">
                    <span className="text-slate-400 font-medium">Servings Remaining:</span>
                    <span className="font-extrabold text-white font-jakarta">
                      {formatMilliQty(dish.stock_qty_milli, dish.base_unit)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 font-sub">
                    <button
                      onClick={() => setWasteProductId(dish.id)}
                      className="flex-1 py-1.5 bg-[#121620] hover:bg-[#222938] text-slate-300 text-xs font-semibold rounded-xl border border-slate-800/80 transition"
                    >
                      {t.recordWaste}
                    </button>
                    <button
                      onClick={() => openAddModal(dish)}
                      className="p-2 bg-[#121620] hover:bg-[#222938] text-slate-300 rounded-xl border border-slate-800/80 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* GENERAL PRODUCT CATALOG TABLE/GRID */
        <div className="bg-[#181d2a] border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#121620] text-slate-400 uppercase text-[10px] tracking-wider font-sub font-semibold border-b border-slate-800/80">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Cost Price</th>
                  <th className="p-3">Selling Price</th>
                  <th className="p-3">Current Stock</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#121620] transition">
                    <td className="p-3 font-bold text-white font-jakarta">
                      {p.name}
                      {p.item_type === 'dish' && (
                        <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-sub">
                          Dish
                        </span>
                      )}
                    </td>
                    <td className="p-3 capitalize font-sub text-slate-400">{p.category}</td>
                    <td className="p-3 font-sub text-slate-300">{formatCentavos(p.cost_centavos)}</td>
                    <td className="p-3 font-extrabold text-[#22c55e] font-jakarta">
                      {formatCentavos(p.price_centavos)}
                    </td>
                    <td className="p-3 font-sub">
                      <span
                        className={
                          p.stock_qty_milli <= (p.low_stock_qty_milli || 5000)
                            ? 'text-red-400 font-bold'
                            : 'text-slate-200'
                        }
                      >
                        {formatMilliQty(p.stock_qty_milli, p.base_unit)}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => openAddModal(p)}
                        className="p-1.5 bg-[#121620] hover:bg-[#222938] text-slate-300 rounded-lg transition border border-slate-800/80"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-3 font-jakarta">
          <form
            onSubmit={handleFormSubmit}
            className="bg-[#181d2a] border border-slate-800/80 rounded-2xl w-full max-w-md p-5 space-y-3.5 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="font-extrabold text-sm text-white font-jakarta">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 font-sub">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Lucky Me Pancit Canton"
                  className="w-full bg-[#121620] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Barcode / SKU
                </label>
                <div className="flex gap-2 font-sub">
                  <input
                    type="text"
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    placeholder="e.g. 4800016009012"
                    className="flex-1 bg-[#121620] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22c55e]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="bg-[#121620] hover:bg-[#222938] text-[#22c55e] border border-slate-800/80 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <Scan className="w-4 h-4 text-[#22c55e]" />
                    <span>Scan</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="noodles, drinks, sud-an"
                    className="w-full bg-[#121620] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22c55e]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Unit</label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full bg-[#121620] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Selling Price (₱) *
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full bg-[#121620] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white font-bold font-jakarta focus:outline-none focus:border-[#22c55e]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Cost Price (₱)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full bg-[#121620] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white font-bold font-jakarta focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    step="1"
                    value={formStockQty}
                    onChange={(e) => setFormStockQty(e.target.value)}
                    className="w-full bg-[#121620] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white font-bold font-jakarta focus:outline-none focus:border-[#22c55e]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Item Type</label>
                  <select
                    value={formItemType}
                    onChange={(e) => setFormItemType(e.target.value as any)}
                    className="w-full bg-[#121620] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="retail">Sari-Sari Retail Item</option>
                    <option value="dish">Carinderia Prepared Dish</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-extrabold text-xs rounded-xl transition shadow-sm mt-2 font-jakarta"
            >
              Save Product
            </button>
          </form>
        </div>
      )}

      {/* RECORD WASTE MODAL */}
      {wasteProductId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-4 space-y-3 shadow-2xl">
            <h3 className="font-bold text-sm text-white">Record Dish Leftover / Waste</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Quantity Discarded</label>
                <input
                  type="number"
                  value={wasteQtyInput}
                  onChange={(e) => setWasteQtyInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Reason</label>
                <input
                  type="text"
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setWasteProductId(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleWasteSubmit}
                className="flex-1 py-2 bg-red-500 hover:bg-red-400 text-white text-xs font-bold rounded-lg"
              >
                Confirm Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScannerModal
          title="Scan Product Barcode"
          onScanSuccess={(code) => {
            setFormBarcode(code);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
