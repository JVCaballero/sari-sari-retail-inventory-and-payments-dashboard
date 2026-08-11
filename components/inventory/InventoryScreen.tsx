'use client';

import React, { useState } from 'react';
import { Product, InventoryMovement } from '@/lib/types/domain';
import { useI18n } from '@/lib/i18n/context';
import { formatCentavos, parseToCentavos } from '@/lib/utils/currency';
import { formatMilliQty, qtyToMilli } from '@/lib/utils/units';
import {
  Layers,
  PlusCircle,
  ArrowDownRight,
  ArrowUpRight,
  History,
  X,
  Truck,
  Copy,
  Check,
  AlertTriangle,
  Send,
} from 'lucide-react';

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
  const [activeSubTab, setActiveSubTab] = useState<'movements' | 'restock'>('movements');
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qtyInput, setQtyInput] = useState('10');
  const [costInput, setCostInput] = useState('');
  const [reasonInput, setReasonInput] = useState('Wholesale Restock');
  const [copiedPO, setCopiedPO] = useState(false);
  const [isBatchReceiving, setIsBatchReceiving] = useState(false);

  // Compute low stock items for restock PO
  const lowStockProducts = products.filter(
    (p) => p.is_active === 1 && p.stock_qty_milli <= (p.low_stock_qty_milli ?? 5000)
  );

  const restockItems = lowStockProducts.map((p) => {
    const targetMilli = Math.max(20000, (p.low_stock_qty_milli ?? 5000) * 3);
    const neededMilli = Math.max(10000, targetMilli - p.stock_qty_milli);
    const unitCost = p.cost_centavos || Math.round(p.price_centavos * 0.75);
    const totalCostCentavos = Math.round((neededMilli / 1000) * unitCost);
    return {
      product: p,
      neededMilli,
      unitCostCentavos: unitCost,
      totalCostCentavos,
    };
  });

  const totalPOCostCentavos = restockItems.reduce((acc, curr) => acc + curr.totalCostCentavos, 0);

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

  const handleCopyRestockPO = () => {
    const lines = [
      `📦 RESTOCK PURCHASE ORDER - TINDAHALIN`,
      `Date: ${new Date().toLocaleDateString('en-PH')}`,
      `Total Estimated Cost: ${formatCentavos(totalPOCostCentavos)}`,
      `----------------------------------------`,
      ...restockItems.map(
        (item) =>
          `• ${item.product.name}: ${formatMilliQty(item.neededMilli, item.product.base_unit)} (Est. ${formatCentavos(item.unitCostCentavos)}/ea = ${formatCentavos(item.totalCostCentavos)})`
      ),
      `----------------------------------------`,
      `Please deliver at your earliest convenience. Thank you!`,
    ];
    const poText = lines.join('\n');
    navigator.clipboard.writeText(poText);
    setCopiedPO(true);
    setTimeout(() => setCopiedPO(false), 2500);
  };

  const handleBatchStockIn = async () => {
    setIsBatchReceiving(true);
    try {
      for (const item of restockItems) {
        await onReceiveStock(
          item.product.id,
          item.neededMilli,
          item.unitCostCentavos,
          'Auto-Restock PO Batch Delivery'
        );
      }
    } catch (err) {
      console.error('Batch stock in failed', err);
    } finally {
      setIsBatchReceiving(false);
    }
  };

  return (
    <div className="pb-24 pt-2 max-w-7xl mx-auto px-2 md:px-4 space-y-3.5 font-jakarta">
      {/* Action Header & View Subtabs */}
      <div className="bg-[#181d2a] border border-slate-800/80 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#22c55e]" />
          <div>
            <h2 className="font-extrabold text-sm text-white font-jakarta">{t.navInventory}</h2>
            <p className="text-[11px] text-slate-400 font-sub">
              Stock Movement Audits & Auto Supplier Purchase Orders
            </p>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center bg-[#121620] p-1 rounded-xl border border-slate-800/80 text-xs font-sub font-bold">
          <button
            onClick={() => setActiveSubTab('movements')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'movements'
                ? 'bg-[#22c55e] text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Movement Logs</span>
          </button>
          <button
            onClick={() => setActiveSubTab('restock')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 relative ${
              activeSubTab === 'restock'
                ? 'bg-[#22c55e] text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Supplier Restock PO</span>
            {lowStockProducts.length > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {lowStockProducts.length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={() => setShowStockInModal(true)}
          className="bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm font-jakarta ml-auto md:ml-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.stockIn}</span>
        </button>
      </div>

      {/* VIEW 1: MOVEMENT AUDIT TRAIL */}
      {activeSubTab === 'movements' && (
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
      )}

      {/* VIEW 2: SUPPLIER RESTOCK AUTO-ORDER (PO) */}
      {activeSubTab === 'restock' && (
        <div className="space-y-4">
          <div className="bg-[#181d2a] border border-slate-800/80 rounded-2xl p-4 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">Automated Supplier Purchase Order (PO)</h3>
                  <p className="text-[11px] text-slate-400 font-sub">
                    Auto-calculates restock needs for items at or below safety stock threshold.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyRestockPO}
                  disabled={restockItems.length === 0}
                  className="bg-[#121620] hover:bg-[#222938] border border-slate-800/80 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {copiedPO ? <Check className="w-4 h-4 text-[#22c55e]" /> : <Copy className="w-4 h-4 text-amber-400" />}
                  <span>{copiedPO ? 'PO Copied to Clipboard!' : 'Copy PO for Viber / SMS'}</span>
                </button>

                <button
                  onClick={handleBatchStockIn}
                  disabled={restockItems.length === 0 || isBatchReceiving}
                  className="bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isBatchReceiving ? 'Processing Stock-In...' : 'Receive All Restock Items'}</span>
                </button>
              </div>
            </div>

            {restockItems.length === 0 ? (
              <div className="text-center py-12 bg-[#121620] rounded-xl border border-slate-800/80 p-6 space-y-2">
                <Check className="w-10 h-10 text-[#22c55e] mx-auto opacity-80" />
                <h4 className="font-extrabold text-sm text-white">All Inventory Levels Healthy!</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto font-sub">
                  No items currently breach safety stock thresholds. All sari-sari items and menu servings are well-stocked.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="overflow-x-auto font-sub">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#121620] text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800/80">
                      <tr>
                        <th className="p-3">Item Name</th>
                        <th className="p-3">Current Stock</th>
                        <th className="p-3">Safety Margin</th>
                        <th className="p-3">Recommended PO Qty</th>
                        <th className="p-3">Est. Unit Cost</th>
                        <th className="p-3">Total Est. Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {restockItems.map(({ product, neededMilli, unitCostCentavos, totalCostCentavos }) => (
                        <tr key={product.id} className="hover:bg-[#121620]/60 transition">
                          <td className="p-3 font-extrabold text-white font-jakarta flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{product.name}</span>
                          </td>
                          <td className="p-3 text-red-400 font-bold font-jakarta">
                            {formatMilliQty(product.stock_qty_milli, product.base_unit)}
                          </td>
                          <td className="p-3 text-slate-400">
                            {formatMilliQty(product.low_stock_qty_milli ?? 5000, product.base_unit)}
                          </td>
                          <td className="p-3 text-[#22c55e] font-extrabold font-jakarta">
                            +{formatMilliQty(neededMilli, product.base_unit)}
                          </td>
                          <td className="p-3 font-bold">{formatCentavos(unitCostCentavos)}</td>
                          <td className="p-3 font-extrabold text-white">{formatCentavos(totalCostCentavos)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center bg-[#121620] p-3 rounded-xl border border-slate-800/80 font-jakarta">
                  <span className="text-xs font-bold text-slate-300">Total Purchase Order Cost Estimate:</span>
                  <span className="text-sm font-black text-[#22c55e]">{formatCentavos(totalPOCostCentavos)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
