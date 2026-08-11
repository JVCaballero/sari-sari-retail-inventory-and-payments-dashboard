'use client';

import React, { useState } from 'react';
import { Customer, CreditEntry } from '@/lib/types/domain';
import { useI18n } from '@/lib/i18n/context';
import { formatCentavos } from '@/lib/utils/currency';
import {
  UserCheck,
  Search,
  Plus,
  DollarSign,
  History,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Phone,
  MessageSquare,
  FileText,
  UserPlus,
} from 'lucide-react';

interface UtangLedgerScreenProps {
  customers: Customer[];
  creditEntries: CreditEntry[];
  onRecordPayment: (customerId: string, amountCentavos: number, note: string) => Promise<void>;
  onCreateCustomer: (name: string, phone?: string, notes?: string) => Promise<Customer>;
}

export function UtangLedgerScreen({
  customers,
  creditEntries,
  onRecordPayment,
  onCreateCustomer,
}: UtangLedgerScreenProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Payment Form State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmountInput, setPaymentAmountInput] = useState('');
  const [paymentNote, setPaymentNote] = useState('Utang Payment Received');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Suki Customer Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Total Outstanding Debt Calculation
  const totalOwedCentavos = customers.reduce(
    (sum, c) => sum + (c.current_balance_centavos || 0),
    0
  );

  const filteredCustomers = customers.filter(
    (c) =>
      c.display_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  const activeCustomer = selectedCustomer
    ? customers.find((c) => c.id === selectedCustomer.id) || selectedCustomer
    : customers[0] || null;

  const customerEntries = activeCustomer
    ? creditEntries.filter((e) => e.customer_id === activeCustomer.id)
    : [];

  const handleOpenPayment = (customer: Customer) => {
    setSelectedCustomer(customer);
    const balance = customer.current_balance_centavos || 0;
    setPaymentAmountInput((balance / 100).toFixed(2));
    setPaymentNote('Partial Utang Repayment');
    setShowPaymentModal(true);
  };

  const handleQuickAmount = (amount: number) => {
    setPaymentAmountInput(amount.toString());
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer) return;
    const amount = Math.round(parseFloat(paymentAmountInput || '0') * 100);
    if (amount <= 0) return;

    setIsSubmitting(true);
    try {
      await onRecordPayment(activeCustomer.id, amount, paymentNote || 'Utang Repayment');
      setShowPaymentModal(false);
      setPaymentAmountInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      const created = await onCreateCustomer(
        newName.trim(),
        newPhone.trim() || undefined,
        newNotes.trim() || undefined
      );
      setSelectedCustomer(created);
      setShowCreateModal(false);
      setNewName('');
      setNewPhone('');
      setNewNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareStatement = (cust: Customer) => {
    const balance = formatCentavos(cust.current_balance_centavos || 0);
    const msg = `Magandang araw ${cust.display_name}! Paalala lamang po mula sa ${t.appName}: Ang kasalukuyang natitirang utang balanse po ay ${balance}. Maraming salamat po!`;
    navigator.clipboard.writeText(msg);
    alert('Statement message copied to clipboard! You can paste it into SMS or Messenger.');
  };

  return (
    <div className="space-y-6 pb-24 font-jakarta">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#181d2a] border border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-sub font-semibold uppercase tracking-wider text-amber-400">
              Total Outstanding Utang
            </span>
            <div className="text-2xl font-black text-amber-400 font-jakarta mt-1">
              {formatCentavos(totalOwedCentavos)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-sub">Across all registered Suki profiles</p>
          </div>
          <UserCheck className="w-6 h-6 text-amber-400 shrink-0" />
        </div>

        <div className="bg-[#181d2a] border border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-sub font-semibold uppercase tracking-wider text-slate-400">
              Active Suki Debtors
            </span>
            <div className="text-2xl font-black text-white font-jakarta mt-1">
              {customers.filter((c) => (c.current_balance_centavos || 0) > 0).length} / {customers.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-sub">Customers with pending balance</p>
          </div>
          <Phone className="w-6 h-6 text-slate-300 shrink-0" />
        </div>

        <div className="bg-[#181d2a] border border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-sub font-semibold uppercase tracking-wider text-[#22c55e]">
              Repayments Logged
            </span>
            <div className="text-2xl font-black text-[#22c55e] font-jakarta mt-1">
              {creditEntries.filter((e) => e.entry_type === 'payment').length} Transactions
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-sub">Total payments received recorded</p>
          </div>
          <DollarSign className="w-6 h-6 text-[#22c55e] shrink-0" />
        </div>
      </div>

      {/* Main Grid: Customer List + Ledger History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Suki List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#181d2a] border border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-white text-sm font-jakarta flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Suki Directory</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#121620] hover:bg-[#222938] border border-slate-800/80 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition font-sub shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Suki</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative font-sub">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#121620] border border-slate-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-sub"
              />
            </div>

            {/* Customer List Cards */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-sub">
                  No Suki customer profiles found.
                </div>
              ) : (
                filteredCustomers.map((c) => {
                  const bal = c.current_balance_centavos || 0;
                  const isSelected = activeCustomer?.id === c.id;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
                          : 'bg-[#121620] border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-extrabold text-white text-xs flex items-center gap-2 font-jakarta">
                          <span>{c.display_name}</span>
                          {c.phone && <span className="text-[10px] text-slate-500 font-sub">({c.phone})</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sub">
                          Status:{' '}
                          {bal === 0 ? (
                            <span className="text-[#22c55e] font-semibold">Clear (₱0)</span>
                          ) : bal > 150000 ? (
                            <span className="text-rose-400 font-semibold">High Balance</span>
                          ) : (
                            <span className="text-amber-400 font-semibold">Pending Debt</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="font-black font-jakarta text-sm text-amber-400">
                          {formatCentavos(bal)}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPayment(c);
                          }}
                          className="bg-[#22c55e]/20 hover:bg-[#22c55e]/30 text-[#22c55e] border border-[#22c55e]/30 px-2.5 py-0.5 rounded-lg text-[10px] font-sub font-semibold transition"
                        >
                          Pay
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Customer Statement & Repayment History */}
        <div className="lg:col-span-7">
          {activeCustomer ? (
            <div className="bg-[#181d2a] border border-slate-800/80 rounded-2xl p-5 space-y-5 shadow-sm">
              {/* Customer Header */}
              <div className="flex flex-wrap justify-between items-start gap-3 pb-4 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2 font-jakarta">
                    <h2 className="text-lg font-extrabold text-white">{activeCustomer.display_name}</h2>
                    <span className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 font-sub px-2.5 py-0.5 rounded-full font-semibold">
                      Suki Ledger
                    </span>
                  </div>
                  {activeCustomer.phone && (
                    <p className="text-xs text-slate-400 font-sub mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{activeCustomer.phone}</span>
                    </p>
                  )}
                  {activeCustomer.notes && (
                    <p className="text-xs text-slate-500 italic mt-1 font-sub">{activeCustomer.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShareStatement(activeCustomer)}
                    className="p-2.5 bg-[#121620] border border-slate-800/80 hover:border-slate-700 rounded-xl text-slate-300 text-xs font-sub font-semibold flex items-center gap-1.5 transition"
                    title="Copy SMS Statement"
                  >
                    <MessageSquare className="w-4 h-4 text-sky-400" />
                    <span className="hidden sm:inline">SMS Remind</span>
                  </button>

                  <button
                    onClick={() => handleOpenPayment(activeCustomer)}
                    className="bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-extrabold font-jakarta text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Record Repayment</span>
                  </button>
                </div>
              </div>

              {/* Balance Summary Box */}
              <div className="bg-[#121620] border border-slate-800/80 rounded-xl p-4 flex justify-between items-center font-sub">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Current Outstanding Utang Balance:</span>
                  <div className="text-2xl font-black text-amber-400 mt-0.5 font-jakarta">
                    {formatCentavos(activeCustomer.current_balance_centavos || 0)}
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <span>Standard Credit Limit:</span>
                  <div className="font-bold text-slate-300 font-jakarta">₱2,000.00</div>
                </div>
              </div>

              {/* Transactions Timeline */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs font-jakarta uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#22c55e]" />
                  <span>Transaction & Payment History</span>
                </h4>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {customerEntries.length === 0 ? (
                    <div className="text-center py-10 bg-[#121620] border border-slate-800/80 rounded-xl text-slate-500 text-xs font-sub">
                      No transaction or repayment history recorded yet for this Suki.
                    </div>
                  ) : (
                    customerEntries.map((entry) => {
                      const isPayment = entry.entry_type === 'payment';
                      return (
                        <div
                          key={entry.id}
                          className="p-3 bg-[#121620] border border-slate-800/80 rounded-xl flex items-center justify-between text-xs font-sub"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                isPayment
                                  ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {isPayment ? (
                                <ArrowDownRight className="w-4 h-4" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-2 font-jakarta">
                                <span>{isPayment ? 'Repayment Received' : 'Credit Charge'}</span>
                                <span className="text-[10px] text-slate-500 font-sub">
                                  {new Date(entry.occurred_at).toLocaleString('en-PH', {
                                    dateStyle: 'short',
                                    timeStyle: 'short',
                                  })}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5 font-sub">
                                {entry.note || (isPayment ? 'Utang Repayment' : 'POS Purchase')}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`font-black text-sm font-jakarta ${
                              isPayment ? 'text-[#22c55e]' : 'text-amber-400'
                            }`}
                          >
                            {isPayment ? '-' : '+'}{formatCentavos(entry.amount_centavos)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#181d2a] border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 font-sub text-xs shadow-sm">
              Select or create a Suki customer profile to view statement and repayment logs.
            </div>
          )}
        </div>
      </div>

      {/* Record Repayment Modal */}
      {showPaymentModal && activeCustomer && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-3 font-jakarta">
          <div className="bg-[#181d2a] border border-slate-800/80 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#22c55e]" />
                <h3 className="font-extrabold text-white text-base font-jakarta">Record Repayment</h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#121620] p-3 rounded-xl border border-slate-800/80 flex justify-between items-center text-xs font-sub">
              <span className="text-slate-400">Customer:</span>
              <span className="font-bold text-white font-jakarta">{activeCustomer.display_name}</span>
            </div>

            {/* Quick Amount Pills */}
            <div className="space-y-1.5 font-sub">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Quick Repayment Preset:</label>
              <div className="grid grid-cols-4 gap-2 font-jakarta">
                {[50, 100, 200, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAmount(amt)}
                    className="bg-[#121620] hover:bg-[#222938] border border-slate-800/80 text-slate-200 text-xs font-bold py-2 rounded-xl transition"
                  >
                    ₱{amt}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div className="space-y-1 font-sub">
                <label className="text-xs text-slate-300 font-semibold">Amount Paid (₱):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(e.target.value)}
                  className="w-full bg-[#121620] border border-slate-800/80 rounded-xl px-3 py-2.5 text-lg font-black text-[#22c55e] font-jakarta focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="space-y-1 font-sub">
                <label className="text-xs text-slate-300 font-semibold">Payment Note / Method:</label>
                <input
                  type="text"
                  placeholder="e.g. Paid cash at store, GCash transfer"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full bg-[#121620] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22c55e] font-sub"
                />
              </div>

              <div className="pt-2 flex gap-2 font-jakarta">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-[#121620] border border-slate-800/80 text-slate-300 text-xs py-2.5 rounded-xl font-bold hover:bg-[#222938] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 text-xs py-2.5 rounded-xl font-black transition shadow-sm"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Suki Customer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-3 font-jakarta">
          <div className="bg-[#181d2a] border border-slate-800/80 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-base font-jakarta">Add New Suki Profile</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="space-y-3 text-xs font-sub">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Customer Full Name / Alias:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aling Nena, Mang Juan"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#121620] border border-slate-800/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Mobile Phone Number (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. 09171234567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-[#121620] border border-slate-800/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Notes / Neighborhood Address:</label>
                <input
                  type="text"
                  placeholder="e.g. Block 4 Lot 2, Suki since 2022"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-[#121620] border border-slate-800/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex gap-2 font-jakarta">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-[#121620] border border-slate-800/80 text-slate-300 py-2.5 rounded-xl font-bold hover:bg-[#222938] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 py-2.5 rounded-xl font-black transition shadow-sm"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
