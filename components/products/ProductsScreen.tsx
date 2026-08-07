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
} from 'lucide-react';

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
  const [formCategory, setFormCategory] = useState('noodles');
  const [formPrice, setFormPrice] = useState('15.00');
  const [formCost, setFormCost] = useState('11.50');
  const [formUnit, setFormUnit] = useState('piece');
  const [formItemType, setFormItemType] = useState<'retail' | 'dish'>('retail');
  const [formStockQty, setFormStockQty] = useState('20');
  const [formIsFavorite, setFormIsFavorite] = useState(false);

  // Waste Modal State
  const [wasteProductId, setWasteProductId] = useState<string | null>(null);
  const [wasteQtyInput, setWasteQtyInput] = useState('1');
  const [wasteReason, setWasteReason] = useState('Unsold Leftover');

  const openAddModal = (p?: Product) => {
    if (p) {
      setEditingProduct(p);
      setFormName(p.name);
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
    <div className="pb-24 pt-2 max-w-7xl mx-auto px-2 md:px-4 space-y-3">
      {/* Top Header & Mode Toggle */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'catalog'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Catalog</span>
          </button>
          <button
            onClick={() => setActiveSubTab('carinderia')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'carinderia'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>{t.dailyMenu}</span>
          </button>
        </div>

        <button
          onClick={() => openAddModal()}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* CARINDERIA DAILY MENU SPECIFIC VIEW */}
      {activeSubTab === 'carinderia' ? (
        <div className="space-y-3">
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
            <h3 className="font-bold text-xs text-amber-300 uppercase tracking-wider mb-1">
              🍲 Today&apos;s Prepared Carinderia Servings
            </h3>
            <p className="text-xs text-slate-400">
              Update prepared morning stock, mark dishes sold-out, or record end-of-day leftovers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProducts.map((dish) => {
              const isOut = dish.stock_qty_milli <= 0 || dish.is_sold_out;
              return (
                <div
                  key={dish.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white leading-tight">{dish.name}</h4>
                      <p className="text-xs text-emerald-400 font-mono font-bold mt-0.5">
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
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border transition ${
                        isOut
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {isOut ? t.soldOut : 'Available'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-slate-800 p-2 rounded-lg font-mono">
                    <span className="text-slate-400">Servings Remaining:</span>
                    <span className="font-bold text-white">
                      {formatMilliQty(dish.stock_qty_milli, dish.base_unit)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setWasteProductId(dish.id)}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition"
                    >
                      {t.recordWaste}
                    </button>
                    <button
                      onClick={() => openAddModal(dish)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono border-b border-slate-700">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Cost Price</th>
                  <th className="p-3">Selling Price</th>
                  <th className="p-3">Current Stock</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-850 transition">
                    <td className="p-3 font-semibold text-white">
                      {p.name}
                      {p.item_type === 'dish' && (
                        <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                          Dish
                        </span>
                      )}
                    </td>
                    <td className="p-3 capitalize font-mono text-slate-400">{p.category}</td>
                    <td className="p-3 font-mono">{formatCentavos(p.cost_centavos)}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">
                      {formatCentavos(p.price_centavos)}
                    </td>
                    <td className="p-3 font-mono">
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
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition"
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <form
            onSubmit={handleFormSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-4 space-y-3 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-white">
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

            <div className="space-y-2">
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="noodles, drinks, sud-an"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Unit</label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Cost Price (₱)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Item Type</label>
                  <select
                    value={formItemType}
                    onChange={(e) => setFormItemType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="retail">Sari-Sari Retail Item</option>
                    <option value="dish">Carinderia Prepared Dish</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition shadow mt-2"
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
    </div>
  );
}
