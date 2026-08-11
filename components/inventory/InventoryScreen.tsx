'use client';

import React, { useState } from 'react';
import { Product, InventoryMovement } from '@/lib/types/domain';
import { useI18n } from '@/lib/i18n/context';
import { formatCentavos, parseToCentavos } from '@/lib/utils/currency';
import { formatMilliQty, qtyToMilli } from '@/lib/utils/units';
import { Layers, PlusCircle, ArrowDownRight, ArrowUpRight, History, X } from 'lucide-react';

interface InventoryScreenProps {
  products: Product[];
  movements: InventoryMovement[];
  onReceiveStock: (
    productId: string,
    qtyMilli: number,
    unitCostCentavos: number | null,
    reason: string
  ) => Promise<void>;
}

export function InventoryScreen({
  products,
  movements,
  onReceiveStock,
}: InventoryScreenProps) {
  const { t } = useI18n();
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qtyInput, setQtyInput] = useState('10');
  const [costInput, setCostInput] = useState('');
  const [reasonInput, setReasonInput] = useState('Wholesale Restock');

  const handleStockInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const qtyMilli = qtyToMilli(parseFloat(qtyInput) || 0);
    const unitCost = costInput ? parseToCentavos(costInput) : null;

    await onReceiveStock(selectedProductId, qtyMilli, unitCost, reasonInput);
    setShowStockInModal(false);
    setSelectedProductId('');
    setQtyInput('10');
    setCostInput('');
  };

  return (
    <div className="pb-24 pt-2 max-w-7xl mx-auto px-2 md:px-4 space-y-3.5 font-jakarta">
      {/* Action Header */}
      <div className="bg-[#181d2a] border border-slate-800/80 p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#22c55e]" />
          <h2 className="font-extrabold text-sm text-white font-jakarta">{t.navInventory}</h2>
        </div>

        <button
          onClick={() => setShowStockInModal(true)}
          className="bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm font-jakarta"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.stockIn}</span>
        </button>
      </div>

      {/* Movement Audit Trail Table */}
      <div className="bg-[#181d2a] border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm space-y-3 p-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800/80">
          <History className="w-4 h-4 text-slate-400" />
          <h3 className="font-extrabold text-xs text-slate-300 uppercase tracking-wider font-jakarta">
            {t.movementHistory}
          </h3>
        </div>

        <div className="overflow-x-auto font-sub">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#121620] text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800/80">
              <tr>
                <th className="p-3">Date / Time</th>
                <th className="p-3">Product</th>
                <th className="p-3">Movement Type</th>
                <th className="p-3">Qty Delta</th>
                <th className="p-3">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {movements.map((mov) => {
                const isPositive = mov.qty_delta_milli > 0;
                return (
                  <tr key={mov.id} className="hover:bg-[#121620]/60 transition">
                    <td className="p-3 font-sub text-[11px] text-slate-400">
                      {new Date(mov.occurred_at).toLocaleString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3 font-extrabold text-white font-jakarta">
                      {mov.product_name || mov.product_id}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-lg font-sub uppercase font-semibold ${
                          mov.movement_type === 'sale'
                            ? 'bg-blue-500/20 text-blue-400'
                            : mov.movement_type === 'stock_in' || mov.movement_type === 'opening'
                            ? 'bg-[#22c55e]/20 text-[#22c55e]'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {mov.movement_type}
                      </span>
                    </td>
                    <td className="p-3 font-jakarta font-extrabold">
                      <span className={`flex items-center gap-1 ${isPositive ? 'text-[#22c55e]' : 'text-red-400'}`}>
                        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {formatMilliQty(Math.abs(mov.qty_delta_milli))}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 italic text-[11px] font-sub">{mov.reason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* STOCK IN MODAL */}
      {showStockInModal && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-3 font-jakarta">
          <form
            onSubmit={handleStockInSubmit}
            className="bg-[#181d2a] border border-slate-800/80 rounded-2xl w-full max-w-md p-5 space-y-3.5 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="font-extrabold text-sm text-white font-jakarta">{t.stockIn}</h3>
              <button
                type="button"
                onClick={() => setShowStockInModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 font-sub">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Select Product *
                </label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-[#121620] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22c55e]"
                >
                  <option value="">-- Select Item --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {formatMilliQty(p.stock_qty_milli, p.base_unit)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Quantity Added *
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={qtyInput}
                    onChange={(e) => setQtyInput(e.target.value)}
                    className="w-full bg-[#121620] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white font-bold font-jakarta focus:outline-none focus:border-[#22c55e]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Unit Cost (₱)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={costInput}
                    onChange={(e) => setCostInput(e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-[#121620] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white font-bold font-jakarta focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Reason</label>
                <input
                  type="text"
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  className="w-full bg-[#121620] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-extrabold text-xs rounded-xl transition shadow-sm mt-2 font-jakarta"
            >
              Add Stock
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
