'use client';

import React, { useState } from 'react';
import { StoreConfig } from '@/lib/types/domain';
import { useI18n } from '@/lib/i18n/context';
import { LanguageCode } from '@/lib/i18n/translations';
import {
  Settings,
  Languages,
  Store,
  QrCode,
  Database,
  Download,
  Upload,
  ShieldCheck,
  Check,
  RefreshCw,
} from 'lucide-react';

interface SettingsModalProps {
  config: StoreConfig;
  onUpdateConfig: (updated: Partial<StoreConfig>) => Promise<void>;
  onExportBackup: () => void;
  onImportBackup: (jsonString: string) => Promise<boolean>;
  onClose: () => void;
}

export function SettingsModal({
  config,
  onUpdateConfig,
  onExportBackup,
  onImportBackup,
  onClose,
}: SettingsModalProps) {
  const { language, setLanguage, t } = useI18n();
  const [storeName, setStoreName] = useState(config.store_name);
  const [address, setAddress] = useState(config.address || '');
  const [phone, setPhone] = useState(config.phone || '');
  const [qrName, setQrName] = useState(config.qrph_account_name || '');
  const [qrNumber, setQrNumber] = useState(config.qrph_number || '');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateConfig({
        store_name: storeName,
        address,
        phone,
        qrph_account_name: qrName,
        qrph_number: qrNumber,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportStatus('Restoring backup...');
        const ok = await onImportBackup(content);
        if (ok) {
          setImportStatus('✅ Backup restored successfully! Refreshing view...');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setImportStatus('❌ Invalid backup JSON structure or corrupted file.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
      <div className="bg-[#0a0c14] border border-slate-800 rounded-2xl w-full max-w-2xl p-5 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">System Settings & Governance</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-mono">
            ✕
          </button>
        </div>

        {/* Language Selection */}
        <div className="bg-[#0d111c] border border-slate-800 p-3.5 rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              System Language / Wika
            </h4>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'en', label: 'English (EN)' },
              { id: 'fil', label: 'Filipino / Tagalog (FIL)' },
              { id: 'ceb', label: 'Cebuano (CEB)' },
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setLanguage(lang.id as LanguageCode)}
                className={`py-2 px-3 rounded-lg text-xs font-bold font-mono transition border ${
                  language === lang.id
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                    : 'bg-[#05060a] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Store Info Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="bg-[#0d111c] border border-slate-800 p-3.5 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Store Profile & Receipts
              </h4>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-[#05060a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Barangay / Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#05060a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#05060a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* QR Ph Digital Setup */}
          <div className="bg-[#0d111c] border border-slate-800 p-3.5 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-teal-400" />
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                QR Ph Digital Payment Config
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  GCash / Maya Account Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maria Clara Store"
                  value={qrName}
                  onChange={(e) => setQrName(e.target.value)}
                  className="w-full bg-[#05060a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Registered Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="0917-XXX-XXXX"
                  value={qrNumber}
                  onChange={(e) => setQrNumber(e.target.value)}
                  className="w-full bg-[#05060a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <Check className="w-4 h-4" /> Config Saved
              </span>
            )}
            <div className="ml-auto flex gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition shadow-[0_0_12px_rgba(16,185,129,0.2)]"
              >
                Save Profile Configuration
              </button>
            </div>
          </div>
        </form>

        {/* Database Backup & Disaster Recovery */}
        <div className="bg-[#0d111c] border border-slate-800 p-3.5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Local Database Backup & Restore
              </h4>
            </div>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono">
              Offline First
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Your store database is stored securely in IndexedDB on this device. You can download
            encrypted/validated JSON backups or restore them onto new hardware anytime.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={onExportBackup}
              className="bg-[#05060a] border border-slate-700 hover:border-emerald-500 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Full Store Backup (.json)</span>
            </button>

            <label className="bg-[#05060a] border border-slate-700 hover:border-amber-400 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Import & Restore Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {importStatus && (
            <p className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              {importStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
