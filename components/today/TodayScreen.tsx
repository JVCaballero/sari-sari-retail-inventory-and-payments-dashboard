'use client';

import React, { useState } from 'react';
import { DailySummary, Sale } from '@/lib/types/domain';
import { useI18n } from '@/lib/i18n/context';
import { formatCentavos } from '@/lib/utils/currency';
import { motion } from 'motion/react';
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
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface TodayScreenProps {
  summary: DailySummary | null;
  recentSales: Sale[];
  onCloseDay: (cashCountCentavos: number, notes: string) => Promise<void>;
  onNavigateToAnalytics?: () => void;
}

export function TodayScreen({ summary, recentSales, onCloseDay, onNavigateToAnalytics }: TodayScreenProps) {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="pb-28 pt-2 max-w-7xl mx-auto px-2 md:px-4 space-y-5 font-jakarta"
    >
      {/* Header Bar with Live Indicator */}
      <motion.div
        variants={itemVariants}
        className="bg-[#181d2a] border border-[#222938] p-4 md:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 relative shadow-lg"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22c55e]"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#22c55e] bg-[#22c55e]/15 px-2.5 py-0.5 rounded-md border border-[#22c55e]/30">
              STORE TERMINAL ONLINE
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{t.todaysSales} Dashboard</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            {new Date().toLocaleDateString('en-PH', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          {isDayClosed ? (
            <div className="bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e] text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
              <span>DAY CLOSED & AUDITED</span>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCloseModal(true)}
              className="bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow"
            >
              <Lock className="w-4 h-4" />
              <span>{t.closeDay}</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Asymmetric Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-jakarta">
        {/* HERO CARD: Total Revenue (Spans 7 cols on desktop) */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigateToAnalytics?.()}
          className="lg:col-span-7 bg-[#22c55e] rounded-2xl p-6 text-slate-950 shadow-md relative overflow-hidden flex flex-col justify-between group cursor-pointer border border-[#22c55e]"
        >
          <div className="flex justify-between items-start relative z-10 mb-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider bg-slate-950/15 px-2.5 py-1 rounded-lg text-slate-950 border border-slate-950/10">
                TOTAL GROSS HALIN TODAY
              </span>
              <p className="text-xs text-slate-950/80 font-sub font-medium mt-1.5">
                Real-time synchronized sales revenue
              </p>
            </div>
            <span className="bg-slate-950 text-[#22c55e] text-xs font-black px-2.5 py-1 rounded-xl shadow-sm flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Live Today</span>
            </span>
          </div>

          <div className="relative z-10 my-2">
            <div className="text-4xl md:text-5xl font-black tracking-tight text-slate-950 font-jakarta">
              {formatCentavos(summary?.total_gross_centavos)}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-950/20 flex flex-wrap justify-between items-center text-xs font-bold relative z-10 gap-2">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] text-slate-950/70 block uppercase font-sub font-semibold">Transactions</span>
                <span className="text-sm font-black text-slate-950 font-jakarta">{summary?.transaction_count || 0} Sales</span>
              </div>
              <div className="w-px h-6 bg-slate-950/20"></div>
              <div>
                <span className="text-[10px] text-slate-950/70 block uppercase font-sub font-semibold">Estimated Margin</span>
                <span className="text-sm font-black text-slate-950 font-jakarta">
                  {formatCentavos(summary?.estimated_gross_margin_centavos)}
                </span>
              </div>
            </div>

            <span className="text-xs bg-slate-950 text-white hover:bg-slate-900 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-sm font-sub">
              <span>View Analytics</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </motion.div>

        {/* BENTO STAT CAPSULES (Spans 5 cols on desktop) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          {/* Cash in Drawer */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#181d2a] border border-slate-800/80 p-4 rounded-2xl relative shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-sub font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Physical Cash in Drawer
              </span>
              <div className="text-2xl font-extrabold text-[#22c55e] font-jakarta">
                {formatCentavos(summary?.cash_centavos)}
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5 font-sub font-normal">Expected cash count</span>
            </div>
            <DollarSign className="w-6 h-6 text-[#22c55e] mr-1" />
          </motion.div>

          {/* Suki Utang Credit */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#181d2a] border border-slate-800/80 p-4 rounded-2xl relative shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-sub font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Suki Credit (Utang)
              </span>
              <div className="text-2xl font-extrabold text-amber-400 font-jakarta">
                {formatCentavos(summary?.credit_centavos)}
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5 font-sub font-normal">Recorded to Suki Ledger</span>
            </div>
            <UserCheck className="w-6 h-6 text-amber-400 mr-1" />
          </motion.div>

          {/* QR Ph Digital Collections */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#181d2a] border border-slate-800/80 p-4 rounded-2xl relative shadow-sm hover:shadow-md transition-shadow flex items-center justify-between sm:col-span-2 lg:col-span-1"
          >
            <div>
              <span className="text-[10px] font-sub font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                QR Ph Digital Collections
              </span>
              <div className="text-2xl font-extrabold text-sky-400 font-jakarta">
                {formatCentavos(summary?.qrph_centavos)}
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5 font-sub font-normal">
                {summary?.pending_qr_count ? (
                  <span className="text-amber-400 font-semibold">⚠️ {summary.pending_qr_count} Pending QR</span>
                ) : (
                  <span>Merchant Confirmed</span>
                )}
              </span>
            </div>
            <QrCode className="w-6 h-6 text-sky-400 mr-1" />
          </motion.div>
        </div>
      </div>

      {/* Margin & Low Stock Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-jakarta">
        <motion.div
          variants={itemVariants}
          className="bg-[#181d2a] border border-slate-800/80 p-5 rounded-2xl space-y-2 shadow-sm"
        >
          <h3 className="text-xs font-sub font-semibold text-slate-400 uppercase tracking-wider">
            Estimated Gross Margin Ratio
          </h3>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#22c55e] font-jakarta">
              {formatCentavos(summary?.estimated_gross_margin_centavos)}
            </span>
            <span className="text-xs text-slate-400 font-sub font-medium">
              COGS Cost: {formatCentavos(summary?.estimated_cost_centavos)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sub font-normal">
            Computed based on exact wholesale purchase cost.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-[#181d2a] border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-sm"
        >
          <div>
            <h3 className="text-xs font-sub font-semibold text-slate-400 uppercase tracking-wider">
              Low Stock Alert Capsule
            </h3>
            <p className="text-2xl font-extrabold text-white mt-1 font-jakarta">
              {summary?.low_stock_count || 0} Items Low
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-sub font-normal">Items requiring restock soon</p>
          </div>
          <AlertTriangle className="w-6 h-6 text-rose-400 mr-1" />
        </motion.div>
      </div>

      {/* Recent Transactions List with Tactile Cards */}
      <motion.div
        variants={itemVariants}
        className="bg-[#181d2a] border border-[#222938] rounded-2xl p-4 md:p-5 space-y-3 shadow-md"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#222938]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#22c55e]" />
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">
              Recent Today&apos;s Transactions
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {recentSales.length} Completed Today
          </span>
        </div>

        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {recentSales.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center italic">
              No sales recorded today yet. Use the Sell screen to start scanning items!
            </p>
          ) : (
            recentSales.map((sale) => (
              <motion.div
                key={sale.id}
                whileHover={{ scale: 1.005, backgroundColor: '#222938' }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#121620] p-3 rounded-xl border border-[#222938] flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{sale.sale_number}</span>
                    <span className="text-[10px] text-slate-400">
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
                  <span className="font-black text-[#22c55e] text-sm block">
                    {formatCentavos(sale.total_centavos)}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {sale.payments?.[0]?.method || 'cash'}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* CLOSE DAY MODAL */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-3">
          <motion.form
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onSubmit={handleCloseDaySubmit}
            className="bg-[#181d2a] border border-[#222938] rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl relative"
          >
            <div className="border-b border-[#222938] pb-3 flex justify-between items-center">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#22c55e]" />
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

            <div className="bg-[#121620] p-3 rounded-xl border border-[#222938] space-y-1 text-xs font-semibold">
              <div className="flex justify-between text-slate-400">
                <span>Expected Drawer Cash:</span>
                <span className="font-bold text-white">{formatCentavos(expectedCash)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>QR Ph Digital Total:</span>
                <span className="font-bold text-sky-300">{formatCentavos(summary?.qrph_centavos)}</span>
              </div>
            </div>

            <div className="space-y-3">
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
                  className="w-full bg-[#121620] border border-[#222938] rounded-xl px-3 py-2.5 text-lg font-black text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              {cashCountInput && (
                <div
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                    cashVariance === 0
                      ? 'bg-[#22c55e]/15 border-[#22c55e]/30 text-[#22c55e]'
                      : cashVariance > 0
                      ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                      : 'bg-red-500/15 border-red-500/30 text-red-400'
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
                  className="w-full bg-[#121620] border border-[#222938] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-extrabold text-sm rounded-xl transition shadow"
            >
              Confirm & Lock Day
            </button>
          </motion.form>
        </div>
      )}
    </motion.div>
  );
}

