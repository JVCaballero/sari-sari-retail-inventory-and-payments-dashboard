'use client';

import React, { useState } from 'react';
import { DailySummary, Sale } from '@/lib/types/domain';
import { useI18n } from '@/lib/i18n/context';
import { formatCentavos } from '@/lib/utils/currency';
import {
  Calendar,
  DollarSign,
  QrCode,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface TodayScreenProps {
  summary: DailySummary | null;
  recentSales: Sale[];
  onCloseDay: (cashCountCentavos: number, notes: string) => Promise<void>;
}

export function TodayScreen({ summary, recentSales, onCloseDay }: TodayScreenProps) {
  const { t } = useI18n();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [cashCountInput, setCashCountInput] = useState('');
  const [closeNotes, setCloseNotes] = useState('');
  const [isDayClosed, setIsDayClosed] = useState(false);

  const handleCloseDaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const count = Math.round((parseFloat(cashCountInput) || 0) * 100);
    await onCloseDay(count, closeNotes);
    setIsDayClosed(true);
    setShowCloseModal(false);
  };

  const expectedCash = summary?.cash_centavos || 0;
  const actualCash = Math.round((parseFloat(cashCountInput) || 0) * 100);
  const cashVariance = actualCash - expectedCash;

  return (
    <div className="pb-28 pt-2 max-w-7xl mx-auto px-2 md:px-4 space-y-4">
      {/* Header Banner with Glow */}
      <div className="bg-[#0a0c14] border border-slate-800/80 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 shadow-[0_0_12px_#10b981]"></div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              SYSTEM_DAILY_RECONCILIATION
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">{t.todaysSales} Dashboard</h2>
          <p className="text-xs text-slate-400">
            {new Date().toLocaleDateString('en-PH', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDayClosed ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>DAY CLOSED & AUDITED</span>
            </div>
          ) : (
            <button
              onClick={() => setShowCloseModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{t.closeDay}</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Financial Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Gross Sales */}
        <div className="bg-[#0d111c] border border-slate-800/80 p-3.5 rounded-xl relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
            <span>GROSS HALIN</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white tracking-tight">
            {formatCentavos(summary?.total_gross_centavos)}
          </p>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">
            {summary?.transaction_count || 0} Total Transactions
          </span>
        </div>

        {/* Cash Sales */}
        <div className="bg-[#0d111c] border border-slate-800/80 p-3.5 rounded-xl relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
            <span>CASH IN DRAWER</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 tracking-tight">
            {formatCentavos(summary?.cash_centavos)}
          </p>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Physical Drawer Expected</span>
        </div>

        {/* QR Ph Collections */}
        <div className="bg-[#0d111c] border border-slate-800/80 p-3.5 rounded-xl relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
            <span>QR PH DIGITAL</span>
            <QrCode className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-teal-300 tracking-tight">
            {formatCentavos(summary?.qrph_centavos)}
          </p>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block flex items-center gap-1">
            {summary?.pending_qr_count ? (
              <span className="text-amber-400 font-bold">⚠️ {summary.pending_qr_count} Pending QR</span>
            ) : (
              <span>All Merchant Confirmed</span>
            )}
          </span>
        </div>

        {/* Utang Owed */}
        <div className="bg-[#0d111c] border border-slate-800/80 p-3.5 rounded-xl relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
            <span>CREDIT (UTANG)</span>
            <UserCheck className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 tracking-tight">
            {formatCentavos(summary?.credit_centavos)}
          </p>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Recorded to Suki Ledger</span>
        </div>
      </div>

      {/* Margin & Low Stock Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-[#0d111c] border border-slate-800/80 p-4 rounded-xl space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Estimated Gross Margin
          </h3>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-400">
              {formatCentavos(summary?.estimated_gross_margin_centavos)}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Cost Est: {formatCentavos(summary?.estimated_cost_centavos)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            * Margin based on recorded cost prices at time of sale.
          </p>
        </div>

        <div className="bg-[#0d111c] border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Low Stock Warnings
            </h3>
            <p className="text-xl font-black text-white mt-1">
              {summary?.low_stock_count || 0} Items
            </p>
            <p className="text-[11px] text-slate-400">Items requiring restock soon</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-400 opacity-80" />
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-[#0d111c] border border-slate-800/80 rounded-xl p-3 space-y-2 shadow-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-mono">
              Recent Today&apos;s Transactions
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {recentSales.length} Total Today
          </span>
        </div>

        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
          {recentSales.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No sales recorded today yet.</p>
          ) : (
            recentSales.map((sale) => (
              <div
                key={sale.id}
                className="bg-[#05060a] p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-white">{sale.sale_number}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(sale.sold_at).toLocaleTimeString('en-PH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {sale.items?.map((i) => i.product_name_snapshot).join(', ') || 'Cart items'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-black text-emerald-400 text-sm block font-mono">
                    {formatCentavos(sale.total_centavos)}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                    {sale.payments?.[0]?.method || 'cash'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CLOSE DAY MODAL */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <form
            onSubmit={handleCloseDaySubmit}
            className="bg-[#0a0c14] border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl relative"
          >
            <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <span>{t.closeDay} - Final Reconciliation</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#05060a] p-3 rounded-xl border border-slate-800/80 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Expected Drawer Cash:</span>
                <span className="font-bold text-white">{formatCentavos(expectedCash)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>QR Ph Digital Total:</span>
                <span className="font-bold text-teal-300">{formatCentavos(summary?.qrph_centavos)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Actual Counted Cash in Drawer (₱) *
                </label>
                <input
                  type="number"
                  step="0.25"
                  required
                  placeholder="0.00"
                  value={cashCountInput}
                  onChange={(e) => setCashCountInput(e.target.value)}
                  className="w-full bg-[#0d111c] border border-slate-700 rounded-xl px-3 py-2.5 text-lg font-black text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {cashCountInput && (
                <div
                  className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between ${
                    cashVariance === 0
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : cashVariance > 0
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                >
                  <span>Drawer Variance:</span>
                  <span className="font-bold text-sm">
                    {cashVariance >= 0 ? `+${formatCentavos(cashVariance)}` : formatCentavos(cashVariance)}
                  </span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Closing Notes / Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid ₱100 ice delivery from drawer"
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  className="w-full bg-[#0d111c] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              Confirm & Lock Day
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
