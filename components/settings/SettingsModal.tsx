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
  pendingOutboxCount?: number;
  onFlushOutbox?: () => Promise<number>;
  onArchiveSales?: (monthsToKeep: number) => Promise<{ archivedCount: number; totalGrossCentavos: number }>;
  onUpdateConfig: (updated: Partial<StoreConfig>) => Promise<void>;
  onExportBackup: () => void;
  onImportBackup: (jsonString: string) => Promise<boolean>;
  onClose: () => void;
}

export function SettingsModal({
  config,
  pendingOutboxCount = 0,
  onFlushOutbox,
  onArchiveSales,
  onUpdateConfig,
  onExportBackup,
  onImportBackup,
  onClose,
}: SettingsModalProps) {
  const { language, setLanguage, t } = useI18n();
  const [storeName, setStoreName] = useState(config.store_name);
  const [address, setAddress] = useState(config.address || '');
  const [phone, setPhone] = useState(config.phone || '');
  const [taxId, setTaxId] = useState(config.tax_id_or_tin || '');
  const [footerNote, setFooterNote] = useState(config.receipt_footer_note || 'Salamat sa pagtangkilik! Babalik po kayo.');
  const [logoUrl, setLogoUrl] = useState(config.receipt_logo_url || '');
  const [qrName, setQrName] = useState(config.qrph_account_name || '');
  const [qrNumber, setQrNumber] = useState(config.qrph_number || '');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [archiveStatus, setArchiveStatus] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleFlushClick = async () => {
    if (!onFlushOutbox) return;
    setSyncStatus('Syncing offline sales outbox to cloud...');
    const flushed = await onFlushOutbox();
    setSyncStatus(`✅ Successfully synced ${flushed} offline transaction(s) to cloud!`);
    setTimeout(() => setSyncStatus(null), 3000);
  };

  const handleArchiveClick = async (months: number) => {
    if (!onArchiveSales) return;
    setIsArchiving(true);
    setArchiveStatus(`Compacting transactions older than ${months} month(s)...`);
    try {
      const result = await onArchiveSales(months);
      if (result.archivedCount > 0) {
        setArchiveStatus(`✅ Archived ${result.archivedCount} old sales into monthly summary rollups!`);
      } else {
        setArchiveStatus(`ℹ️ No sales older than ${months} month(s) found to archive.`);
      }
    } catch (err) {
      console.error(err);
      setArchiveStatus('❌ Failed to archive sales.');
    } finally {
      setIsArchiving(false);
      setTimeout(() => setArchiveStatus(null), 4000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateConfig({
        store_name: storeName,
        address,
        phone,
        tax_id_or_tin: taxId,
        receipt_footer_note: footerNote,
        receipt_logo_url: logoUrl,
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
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-3 font-jakarta">
      <div className="bg-[#181d2a] border border-slate-800/80 rounded-2xl w-full max-w-2xl p-5 space-y-4 shadow-xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 font-jakarta">
            <Settings className="w-5 h-5 text-[#22c55e]" />
            <h3 className="font-extrabold text-base text-white">System Settings & Governance</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-sub">
            ✕
          </button>
        </div>

        {/* Language Selection */}
        <div className="bg-[#121620] border border-slate-800/80 p-3.5 rounded-xl space-y-2.5">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-[#22c55e]" />
            <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider font-jakarta">
              System Language / Wika
            </h4>
          </div>
          <div className="grid grid-cols-3 gap-2 font-sub">
            {[
              { id: 'en', label: 'English (EN)' },
              { id: 'fil', label: 'Filipino / Tagalog (FIL)' },
              { id: 'ceb', label: 'Cebuano (CEB)' },
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setLanguage(lang.id as LanguageCode)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold font-sub transition border ${
                  language === lang.id
                    ? 'bg-[#22c55e]/10 border-[#22c55e] text-[#22c55e] shadow-sm'
                    : 'bg-[#181d2a] border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Store Info Form */}
        <form onSubmit={handleSave} className="space-y-4 font-sub">
          <div className="bg-[#121620] border border-slate-800/80 p-3.5 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#22c55e]" />
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider font-jakarta">
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
                className="w-full bg-[#181d2a] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white focus:border-[#22c55e] focus:outline-none"
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
                  className="w-full bg-[#181d2a] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22c55e]"
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
                  className="w-full bg-[#181d2a] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-800/60">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  TIN / Business Permit #
                </label>
                <input
                  type="text"
                  placeholder="e.g. TIN: 123-456-789-000"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full bg-[#181d2a] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Thermal Printer Logo URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://.../logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-[#181d2a] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Custom Thermal Receipt Footer Message
              </label>
              <input
                type="text"
                placeholder="e.g. Salamat sa pagtangkilik! Babalik po kayo."
                value={footerNote}
                onChange={(e) => setFooterNote(e.target.value)}
                className="w-full bg-[#181d2a] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22c55e]"
              />
            </div>
          </div>

          {/* QR Ph Digital Setup */}
          <div className="bg-[#121620] border border-slate-800/80 p-3.5 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-teal-400" />
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider font-jakarta">
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
                  className="w-full bg-[#181d2a] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22c55e]"
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
                  className="w-full bg-[#181d2a] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between font-jakarta">
            {saveSuccess && (
              <span className="text-xs text-[#22c55e] font-sub font-bold flex items-center gap-1">
                <Check className="w-4 h-4 text-[#22c55e]" /> Config Saved
              </span>
            )}
            <div className="ml-auto flex gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl transition shadow-sm font-jakarta"
              >
                Save Profile Configuration
              </button>
            </div>
          </div>
        </form>

        {/* Cloud Outbox Sync Queue Section */}
        <div className="bg-[#121620] border border-slate-800/80 p-3.5 rounded-xl space-y-3 font-sub">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider font-jakarta">
                Cloud Sync Outbox Queue
              </h4>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-sub font-bold">
              {pendingOutboxCount} Pending
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-sub">
            All offline sales, stock movements, and customer repayments are recorded locally first in an idempotent outbox queue, then automatically synced to cloud storage when internet is restored.
          </p>

          <div className="flex items-center justify-between pt-1 font-jakarta">
            <button
              onClick={handleFlushClick}
              className="bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 transition shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Flush & Sync Outbox Now</span>
            </button>
          </div>

          {syncStatus && (
            <p className="text-xs font-sub font-semibold text-emerald-300 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
              {syncStatus}
            </p>
          )}
        </div>

        {/* Monthly Sales Rollup & Database Archiving Section */}
        <div className="bg-[#121620] border border-slate-800/80 p-3.5 rounded-xl space-y-3 font-sub">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider font-jakarta">
                Monthly Sales Rollup & Storage Compaction
              </h4>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-sub font-semibold">
              High Speed Maintenance
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-sub">
            For high-volume sari-sari or carinderia stores processing hundreds of micro-transactions per day, compact historical transactions into lightweight monthly summaries while preserving all revenue metrics.
          </p>

          <div className="flex flex-wrap gap-2 pt-1 font-jakarta">
            <button
              type="button"
              onClick={() => handleArchiveClick(3)}
              disabled={isArchiving}
              className="bg-[#181d2a] border border-slate-800/80 hover:border-amber-400 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              Archive Sales Older Than 3 Months
            </button>
            <button
              type="button"
              onClick={() => handleArchiveClick(1)}
              disabled={isArchiving}
              className="bg-[#181d2a] border border-slate-800/80 hover:border-amber-400 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              Archive Sales Older Than 1 Month
            </button>
          </div>

          {archiveStatus && (
            <p className="text-xs font-sub font-semibold text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              {archiveStatus}
            </p>
          )}
        </div>

        {/* Database Backup & Disaster Recovery */}
        <div className="bg-[#121620] border border-slate-800/80 p-3.5 rounded-xl space-y-3 font-sub">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider font-jakarta">
                Local Database Backup & Restore
              </h4>
            </div>
            <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded font-sub font-semibold">
              Offline First
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-sub">
            Your store database is stored securely in IndexedDB on this device. You can download
            encrypted/validated JSON backups or restore them onto new hardware anytime.
          </p>

          <div className="flex flex-wrap gap-2 pt-1 font-jakarta">
            <button
              onClick={onExportBackup}
              className="bg-[#181d2a] border border-slate-800/80 hover:border-[#22c55e] text-slate-200 text-xs font-extrabold px-3.5 py-2 rounded-xl flex items-center gap-2 transition shadow-sm"
            >
              <Download className="w-4 h-4 text-[#22c55e]" />
              <span>Export Full Store Backup (.json)</span>
            </button>

            <label className="bg-[#181d2a] border border-slate-800/80 hover:border-amber-400 text-slate-200 text-xs font-extrabold px-3.5 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm">
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
            <p className="text-xs font-sub font-semibold text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              {importStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
