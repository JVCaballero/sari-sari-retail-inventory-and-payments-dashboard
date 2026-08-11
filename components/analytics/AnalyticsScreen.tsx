'use client';

import React, { useState } from 'react';
import { Sale, Product, PaymentMethod } from '@/lib/types/domain';
import { formatCentavos } from '@/lib/utils/currency';
import { motion } from 'motion/react';
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart2,
  DollarSign,
  Package,
  Calendar,
  Percent,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface AnalyticsScreenProps {
  sales: Sale[];
  products: Product[];
}

export function AnalyticsScreen({ sales, products }: AnalyticsScreenProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

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

  // Calculate totals
  const totalGrossCentavos = sales.reduce((sum, s) => sum + s.total_centavos, 0);
  
  // Calculate COGS
  let totalCogsCentavos = 0;
  sales.forEach((s) => {
    if (s.items) {
      s.items.forEach((item) => {
        const cost = item.unit_cost_centavos || 0;
        const qty = item.qty_milli / 1000;
        totalCogsCentavos += Math.round(cost * qty);
      });
    }
  });

  const grossProfitCentavos = Math.max(0, totalGrossCentavos - totalCogsCentavos);
  const marginPercent = totalGrossCentavos > 0
    ? ((grossProfitCentavos / totalGrossCentavos) * 100).toFixed(1)
    : '0.0';

  // Group sales by date for Area Chart
  const salesByDateMap: Record<string, { gross: number; profit: number }> = {};
  
  // Initialize last 7 or 30 days
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 14;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    salesByDateMap[dateStr] = { gross: 0, profit: 0 };
  }

  sales.forEach((s) => {
    const dateStr = (s.sold_at || s.created_at).split('T')[0];
    if (!salesByDateMap[dateStr]) {
      salesByDateMap[dateStr] = { gross: 0, profit: 0 };
    }
    salesByDateMap[dateStr].gross += s.total_centavos / 100;
    
    let saleCogs = 0;
    if (s.items) {
      s.items.forEach((it) => {
        const cost = it.unit_cost_centavos || 0;
        const qty = it.qty_milli / 1000;
        saleCogs += (cost * qty) / 100;
      });
    }
    salesByDateMap[dateStr].profit += Math.max(0, (s.total_centavos / 100) - saleCogs);
  });

  const chartData = Object.keys(salesByDateMap)
    .sort()
    .slice(-days)
    .map((date) => {
      const formatted = new Date(date).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
      });
      return {
        date: formatted,
        Gross: Math.round(salesByDateMap[date].gross),
        Profit: Math.round(salesByDateMap[date].profit),
      };
    });

  // Payment Method Distribution for Pie Chart
  let cashTotal = 0;
  let qrphTotal = 0;
  let creditTotal = 0;

  sales.forEach((s) => {
    if (s.payments) {
      s.payments.forEach((p) => {
        if (p.method === 'cash') cashTotal += p.amount_centavos / 100;
        else if (p.method === 'qrph') qrphTotal += p.amount_centavos / 100;
        else if (p.method === 'credit') creditTotal += p.amount_centavos / 100;
      });
    }
  });

  const paymentData = [
    { name: 'Cash', value: Math.round(cashTotal), color: '#10b981' },
    { name: 'QR Ph (GCash/Maya)', value: Math.round(qrphTotal), color: '#3b82f6' },
    { name: 'Suki Utang', value: Math.round(creditTotal), color: '#f59e0b' },
  ].filter((d) => d.value > 0);

  // Top Selling Items
  const productVolumeMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  sales.forEach((s) => {
    if (s.items) {
      s.items.forEach((it) => {
        if (!productVolumeMap[it.product_id]) {
          productVolumeMap[it.product_id] = { name: it.product_name_snapshot, qty: 0, revenue: 0 };
        }
        productVolumeMap[it.product_id].qty += it.qty_milli / 1000;
        productVolumeMap[it.product_id].revenue += it.line_total_centavos;
      });
    }
  });

  const topProducts = Object.values(productVolumeMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-28 pt-2 font-sans max-w-7xl mx-auto px-2 md:px-4"
    >
      {/* Header & Filter Controls */}
      <motion.div variants={itemVariants} className="flex flex-wrap justify-between items-center gap-3 bg-[#181d2a] border border-slate-800/80 p-4 md:p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#22c55e]" />
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight font-jakarta">Business & Profit Analytics</h2>
          </div>
          <p className="text-xs text-slate-400 font-sub font-normal mt-0.5">COGS, Revenue, and Gross Margin Breakdown</p>
        </div>

        <div className="flex items-center bg-[#121620] border border-slate-800/80 rounded-xl p-1 text-xs font-sub font-medium">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              timeRange === '7d' ? 'bg-[#22c55e] text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              timeRange === '30d' ? 'bg-[#22c55e] text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-jakarta">
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="bg-[#181d2a] border border-slate-800/80 rounded-2xl p-4 space-y-1 shadow-sm"
        >
          <span className="text-[10px] uppercase text-slate-400 font-sub font-semibold tracking-wider">Total Gross Revenue</span>
          <div className="text-2xl font-extrabold text-white font-jakarta">{formatCentavos(totalGrossCentavos)}</div>
          <p className="text-[11px] text-[#22c55e] font-sub font-medium flex items-center gap-1">
            <span>{sales.length} total completed sales</span>
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="bg-[#181d2a] border border-slate-800/80 rounded-2xl p-4 space-y-1 shadow-sm"
        >
          <span className="text-[10px] uppercase text-slate-400 font-sub font-semibold tracking-wider">Cost of Goods (COGS)</span>
          <div className="text-2xl font-extrabold text-slate-200 font-jakarta">{formatCentavos(totalCogsCentavos)}</div>
          <p className="text-[11px] text-slate-400 font-sub font-normal">Estimated wholesale purchase cost</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="bg-[#181d2a] border border-slate-800/80 rounded-2xl p-4 space-y-1 shadow-sm"
        >
          <span className="text-[10px] uppercase text-[#22c55e] font-sub font-semibold tracking-wider">Estimated Gross Margin</span>
          <div className="text-2xl font-extrabold text-[#22c55e] font-jakarta">{formatCentavos(grossProfitCentavos)}</div>
          <p className="text-[11px] text-[#22c55e] font-sub font-semibold">{marginPercent}% Profit Margin Ratio</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="bg-[#181d2a] border border-slate-800/80 rounded-2xl p-4 space-y-1 shadow-sm"
        >
          <span className="text-[10px] uppercase text-slate-400 font-sub font-semibold tracking-wider">Average Sale Basket</span>
          <div className="text-2xl font-extrabold text-sky-400 font-jakarta">
            {sales.length > 0 ? formatCentavos(Math.round(totalGrossCentavos / sales.length)) : '₱0.00'}
          </div>
          <p className="text-[11px] text-slate-400 font-sub font-normal">Per transaction average value</p>
        </motion.div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue & Margin Trend Line/Area Chart */}
        <div className="lg:col-span-8 bg-[#181d2a] border border-[#222938] rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#22c55e]" />
              <span>Revenue vs Profit Trend (₱)</span>
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-[#22c55e]">
                <span className="w-2 h-2 rounded-full bg-[#22c55e]" /> Gross Revenue
              </span>
              <span className="flex items-center gap-1 text-sky-400">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> Gross Profit
              </span>
            </div>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121620',
                    borderColor: '#222938',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#ffffff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Gross"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGross)"
                />
                <Area
                  type="monotone"
                  dataKey="Profit"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Method Distribution Pie Chart */}
        <div className="lg:col-span-4 bg-[#181d2a] border border-[#222938] rounded-2xl p-5 space-y-4 shadow-md flex flex-col justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-sky-400" />
            <span>Payment Method Distribution</span>
          </h3>

          <div className="h-[200px] w-full flex items-center justify-center">
            {paymentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#121620',
                      borderColor: '#222938',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#ffffff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-xs italic">No payment transactions recorded yet</p>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#222938] text-xs font-semibold">
            {paymentData.map((p) => (
              <div key={p.name} className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.name}
                </span>
                <span className="font-extrabold text-white">₱{p.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-[#181d2a] border border-[#222938] rounded-2xl p-5 space-y-4 shadow-md">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Top Performing Products & Items</span>
        </h3>

        <div className="space-y-2">
          {topProducts.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-6 italic">No sales recorded yet.</p>
          ) : (
            topProducts.map((prod, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#121620] border border-[#222938] rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-[#222938] text-amber-400 font-extrabold flex items-center justify-center text-xs">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-white">{prod.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{prod.qty.toFixed(1)} units sold</div>
                  </div>
                </div>

                <div className="text-right font-black text-[#22c55e] text-sm">
                  {formatCentavos(prod.revenue)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
