'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { ShoppingCart, Package, Layers, Calendar, UserCheck, TrendingUp } from 'lucide-react';

export type NavTab = 'sell' | 'products' | 'inventory' | 'utang' | 'analytics' | 'today';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  cartCount?: number;
}

export function Navigation({ activeTab, setActiveTab, cartCount = 0 }: NavigationProps) {
  const { t } = useI18n();

  const navItems = [
    {
      id: 'sell' as NavTab,
      label: t.navSell,
      icon: ShoppingCart,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      id: 'products' as NavTab,
      label: t.navProducts,
      icon: Package,
    },
    {
      id: 'inventory' as NavTab,
      label: t.navInventory,
      icon: Layers,
    },
    {
      id: 'utang' as NavTab,
      label: t.navUtang,
      icon: UserCheck,
    },
    {
      id: 'analytics' as NavTab,
      label: t.navAnalytics,
      icon: TrendingUp,
    },
    {
      id: 'today' as NavTab,
      label: t.navToday,
      icon: Calendar,
    },
  ];

  return (
    <nav className="bg-[#121620] border-t border-slate-800/80 fixed bottom-0 left-0 right-0 z-40 shadow-sm font-jakarta">
      <div className="grid grid-cols-6 max-w-lg md:max-w-2xl mx-auto py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 transition-all rounded-xl ${
                isActive
                  ? 'text-[#22c55e] font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-[#22c55e]' : 'text-slate-400'} transition-transform`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#22c55e] text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-[16px] text-center font-jakarta shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] md:text-[11px] font-sub ${isActive ? 'font-bold text-[#22c55e]' : 'font-medium text-slate-400'} mt-1 tracking-tight leading-none uppercase truncate max-w-[60px]`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
