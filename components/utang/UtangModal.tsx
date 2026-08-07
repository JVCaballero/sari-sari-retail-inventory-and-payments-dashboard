'use client';

import React, { useState } from 'react';
import { Customer } from '@/lib/types/domain';
import { useI18n } from '@/lib/i18n/context';
import { formatCentavos } from '@/lib/utils/currency';
import { UserCheck, Search, Plus, AlertCircle, ShieldAlert } from 'lucide-react';

interface UtangModalProps {
  customers: Customer[];
  cartTotalCentavos: number;
  onSelectCustomer: (customer: Customer) => void;
  onCreateCustomer: (name: string, phone?: string) => Promise<Customer>;
  onClose: () => void;
}

export function UtangModal({
  customers,
  cartTotalCentavos,
  onSelectCustomer,
  onCreateCustomer,
  onClose,
}: UtangModalProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = customers.filter(
    (c) =>
      c.display_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      const created = await onCreateCustomer(newName.trim(), newPhone.trim() || undefined);
      onSelectCustomer(created);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
      <div className="bg-[#0a0c14] border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl relative">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">Suki Utang Ledger</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="bg-[#05060a] p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400">Transaction Amount to Credit:</span>
          <span className="font-bold text-amber-400 text-sm">
            {formatCentavos(cartTotalCentavos)}
          </span>
        </div>

        {!showAddForm ? (
          <>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search Suki customer name or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#0d111c] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-2 rounded-xl text-xs font-bold hover:bg-amber-500/20 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>New Suki</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {filtered.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No Suki customer found matching &quot;{search}&quot;
                </div>
              ) : (
                filtered.map((c) => {
                  const balance = c.current_balance_centavos || 0;
                  const limit = 200000; // ₱2,000 credit limit
                  const wouldExceedLimit = balance + cartTotalCentavos > limit;

                  return (
                    <div
                      key={c.id}
                      onClick={() => onSelectCustomer(c)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                        wouldExceedLimit
                          ? 'bg-red-500/10 border-red-500/30 text-slate-300'
                          : 'bg-[#0d111c] border-slate-800 hover:border-amber-400/50 text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{c.display_name}</span>
                          {c.phone && <span className="text-[10px] text-slate-500 font-mono">{c.phone}</span>}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono mt-1 text-slate-400">
                          <span>Current Owed: {formatCentavos(balance)}</span>
                          <span>| Limit: {formatCentavos(limit)}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        {wouldExceedLimit ? (
                          <div className="text-[10px] text-red-400 font-bold flex items-center gap-1 font-mono">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>EXCEEDS LIMIT</span>
                          </div>
                        ) : (
                          <span className="bg-amber-400 text-slate-950 font-black px-2.5 py-1 rounded text-[11px] font-mono">
                            SELECT
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleCreateCustomer} className="space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
              Register New Suki Customer
            </h4>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aling Nena"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-[#0d111c] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Mobile Number (Optional)
              </label>
              <input
                type="text"
                placeholder="09171234567"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full bg-[#0d111c] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-2 text-slate-400 hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl"
              >
                Save & Select Suki
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
