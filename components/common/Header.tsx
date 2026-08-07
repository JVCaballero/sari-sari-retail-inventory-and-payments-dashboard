'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Settings, Shield, WifiOff, Globe } from 'lucide-react';
import { LanguageCode } from '@/lib/i18n/translations';

interface HeaderProps {
  storeName: string;
  address?: string;
  pendingQrCount?: number;
  onOpenSettings: () => void;
}

export function Header({
  storeName,
  address,
  pendingQrCount = 0,
  onOpenSettings,
}: HeaderProps) {
  const { lang, setLang } = useI18n();

  return (
    <header className="h-16 bg-[#0a0c14] border-b border-slate-800/80 px-4 md:px-8 flex items-center justify-between relative z-20 shadow-2xl">
      {/* Left System Identity Branding */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
          <div>
            <div className="text-[9px] font-bold font-mono uppercase tracking-widest text-slate-500">
              System Blueprint
            </div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>{storeName || 'TindaHalin V1'}</span>
              <span className="text-[10px] font-mono font-normal bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                OFFLINE-FIRST
              </span>
            </h1>
          </div>
        </div>

        {address && (
          <span className="hidden md:inline-block text-xs text-slate-500 font-mono border-l border-slate-800 pl-3">
            {address}
          </span>
        )}
      </div>

      {/* Right Controls: QR Alert, Language Toggle & System Settings */}
      <div className="flex items-center gap-2 md:gap-3">
        {pendingQrCount > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>{pendingQrCount} QR Pending</span>
          </div>
        )}

        {/* Offline Security Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#05060a] border border-slate-800 rounded-lg text-[11px] font-mono text-slate-400">
          <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local Sync Active</span>
        </div>

        {/* Quick Language Dropdown */}
        <div className="flex items-center bg-[#05060a] border border-slate-800 rounded-lg p-0.5 font-mono text-xs">
          <button
            onClick={() => setLang('en')}
            className={`px-2 py-1 rounded font-bold ${
              lang === 'en' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('fil')}
            className={`px-2 py-1 rounded font-bold ${
              lang === 'fil' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            FIL
          </button>
          <button
            onClick={() => setLang('ceb')}
            className={`px-2 py-1 rounded font-bold ${
              lang === 'ceb' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            CEB
          </button>
        </div>

        {/* Settings Governance Modal Launcher */}
        <button
          onClick={onOpenSettings}
          className="p-2 bg-[#0d111c] border border-slate-800 hover:border-emerald-500/50 rounded-xl text-slate-300 hover:text-emerald-400 transition shadow"
          title="Store Settings & Backup"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
