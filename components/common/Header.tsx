'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Settings, Lock, Unlock, WifiOff } from 'lucide-react';

interface HeaderProps {
  storeName: string;
  address?: string;
  pendingQrCount?: number;
  pendingOutboxCount?: number;
  isCashierMode?: boolean;
  onToggleCashierMode?: () => void;
  onFlushOutbox?: () => void;
  onOpenSettings: () => void;
}

export function Header({
  storeName,
  address,
  pendingQrCount = 0,
  pendingOutboxCount = 0,
  isCashierMode = false,
  onToggleCashierMode,
  onFlushOutbox,
  onOpenSettings,
}: HeaderProps) {
  const { lang, setLang } = useI18n();

  return (
    <header className="h-16 bg-[#121620] border-b border-slate-800/80 px-3 md:px-6 flex items-center justify-between relative z-20 shadow-sm font-jakarta">
      {/* Left System Identity Branding */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse"></span>
          <div>
            <div className="text-[10px] font-sub font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>Point of Sale</span>
              {isCashierMode && (
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-black text-[9px] uppercase tracking-normal">
                  CASHIER MODE
                </span>
              )}
            </div>
            <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{storeName || 'TindaHalin'}</span>
              <span className="text-[10px] font-sub font-semibold bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e] px-2 py-0.5 rounded-md">
                OFFLINE-FIRST
              </span>
            </h1>
          </div>
        </div>

        {address && (
          <span className="hidden lg:inline-block text-xs text-slate-400 font-sub font-medium border-l border-slate-800/80 pl-3">
            {address}
          </span>
        )}
      </div>

      {/* Right Controls: Cashier Lock, Sync Outbox, Language Toggle & System Settings */}
      <div className="flex items-center gap-1.5 md:gap-2.5">
        {/* Cashier Mode Quick Lock/Unlock */}
        {onToggleCashierMode && (
          <button
            onClick={onToggleCashierMode}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold font-jakarta transition flex items-center gap-1.5 shadow-sm ${
              isCashierMode
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25'
                : 'bg-[#181d2a] border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title={isCashierMode ? 'Exit Cashier Mode (Requires PIN)' : 'Enable Cashier Quick Mode'}
          >
            {isCashierMode ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">{isCashierMode ? 'Cashier Locked' : 'Owner Mode'}</span>
          </button>
        )}

        {/* Cloud Sync Outbox Indicator */}
        <button
          onClick={onFlushOutbox}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 border rounded-xl text-xs font-sub font-semibold transition ${
            pendingOutboxCount > 0
              ? 'bg-sky-500/15 border-sky-500/40 text-sky-400 hover:bg-sky-500/25'
              : 'bg-[#181d2a] border-slate-800/80 text-slate-300'
          }`}
          title={pendingOutboxCount > 0 ? `${pendingOutboxCount} sales queued in outbox. Click to sync.` : 'All local sales synced!'}
        >
          <WifiOff className="w-3.5 h-3.5 text-[#22c55e]" />
          <span>{pendingOutboxCount > 0 ? `Outbox: ${pendingOutboxCount}` : 'Synced'}</span>
        </button>

        {pendingQrCount > 0 && (
          <div className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-sub font-semibold px-2 py-1 rounded-lg flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>{pendingQrCount} QR Pending</span>
          </div>
        )}

        {/* Quick Language Dropdown */}
        <div className="flex items-center bg-[#181d2a] border border-slate-800/80 rounded-lg p-0.5 text-xs font-sub font-semibold">
          <button
            onClick={() => setLang('en')}
            className={`px-1.5 py-0.5 rounded ${
              lang === 'en' ? 'bg-[#222938] text-[#22c55e]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('fil')}
            className={`px-1.5 py-0.5 rounded ${
              lang === 'fil' ? 'bg-[#222938] text-[#22c55e]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            FIL
          </button>
          <button
            onClick={() => setLang('ceb')}
            className={`px-1.5 py-0.5 rounded ${
              lang === 'ceb' ? 'bg-[#222938] text-[#22c55e]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CEB
          </button>
        </div>

        {/* Settings Governance Modal Launcher */}
        <button
          onClick={onOpenSettings}
          className="p-2 bg-[#181d2a] border border-slate-800/80 hover:border-[#22c55e]/50 rounded-xl text-slate-300 hover:text-[#22c55e] transition shadow-sm"
          title="Store Settings & Backup"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
