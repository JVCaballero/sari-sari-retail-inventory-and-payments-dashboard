'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { ShoppingCart, Package, Layers, Calendar } from 'lucide-react';

export type NavTab = 'sell' | 'products' | 'inventory' | 'today';

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
      id: 'today' as NavTab,
      label: t.navToday,
      icon: Calendar,
    },
  ];

  return (
    <nav className="bg-[#0a0c14]/95 backdrop-blur-md border-t border-slate-800/80 fixed bottom-0 left-0 right-0 z-40 shadow-2xl">
      <div className="grid grid-cols-4 max-w-md md:max-w-xl mx-auto py-1.5 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-1 transition-all rounded-xl ${
                isActive
                  ? 'text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-emerald-400' : 'text-slate-400'} transition-transform`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-[0_0_8px_#10b981]">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono mt-1 tracking-tight leading-none uppercase">{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 w-6 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_6px_#10b981]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
