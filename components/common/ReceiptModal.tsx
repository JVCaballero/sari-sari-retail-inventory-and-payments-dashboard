/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { Sale, StoreConfig } from '@/lib/types/domain';
import { formatCentavos } from '@/lib/utils/currency';
import { Printer, Copy, Check, X, ShieldAlert, Store, FileText } from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale;
  config?: StoreConfig;
  onClose: () => void;
}

export function ReceiptModal({ sale, config, onClose }: ReceiptModalProps) {
  const [copied, setCopied] = useState(false);

  const storeName = config?.store_name || 'TindaHalin Store';
  const address = config?.address || 'Local Neighborhood Store';
  const phone = config?.phone || '';
  const taxId = config?.tax_id_or_tin || '';
  const footerNote = config?.receipt_footer_note || 'Salamat sa pagtangkilik!';
  const logoUrl = config?.receipt_logo_url || '';

  const formattedDate = new Date(sale.sold_at || sale.created_at).toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const generateTextReceipt = () => {
    let text = `==============================\n`;
    text += `       ${storeName.toUpperCase()}\n`;
    if (address) text += `   ${address}\n`;
    if (phone) text += `   Tel: ${phone}\n`;
    if (taxId) text += `   ${taxId}\n`;
    text += `==============================\n`;
    text += `Receipt #: ${sale.sale_number || sale.id.slice(0, 8)}\n`;
    text += `Date: ${formattedDate}\n`;
    text += `------------------------------\n`;
    if (sale.items && sale.items.length > 0) {
      sale.items.forEach((item) => {
        const qty = item.qty_milli / 1000;
        text += `${item.product_name_snapshot}\n`;
        text += `  ${qty} ${item.unit_snapshot} x ${formatCentavos(item.unit_price_centavos)} = ${formatCentavos(item.line_total_centavos)}\n`;
      });
    }
    text += `------------------------------\n`;
    text += `TOTAL: ${formatCentavos(sale.total_centavos)}\n`;
    if (sale.payments && sale.payments.length > 0) {
      sale.payments.forEach((p) => {
        text += `Paid (${p.method.toUpperCase()}): ${formatCentavos(p.amount_centavos)}\n`;
        if (p.reference_suffix) text += `  Ref: ...${p.reference_suffix}\n`;
      });
    }
    text += `==============================\n`;
    text += `${footerNote}\n`;
    text += `* Store Management Record *\n`;
    return text;
  };

  const handleCopyText = () => {
    const receiptText = generateTextReceipt();
    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-3 font-jakarta">
      <div className="bg-[#181d2a] border border-slate-800/80 rounded-2xl w-full max-w-md overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="p-4 bg-[#121620] border-b border-slate-800/80 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#22c55e]" />
            <h3 className="font-extrabold text-white text-sm font-jakarta">Digital & ESC/POS Receipt</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal Receipt Paper View */}
        <div className="p-6 overflow-y-auto bg-white text-slate-900 font-mono text-xs shadow-inner flex-1 select-text print:p-0 print:shadow-none">
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-400">
            {logoUrl ? (
              <img src={logoUrl} alt="Store Logo" className="h-10 mx-auto object-contain mb-1" />
            ) : (
              <div className="flex items-center justify-center gap-1 font-black text-sm uppercase text-slate-950">
                <Store className="w-4 h-4" />
                <span>{storeName}</span>
              </div>
            )}
            {logoUrl && <p className="font-black text-xs uppercase text-slate-950">{storeName}</p>}
            {address && <p className="text-[10px] text-slate-600">{address}</p>}
            {phone && <p className="text-[10px] text-slate-600">Tel: {phone}</p>}
            {taxId && <p className="text-[10px] text-slate-600 font-medium">{taxId}</p>}
            <p className="text-[10px] text-slate-500 font-bold mt-1">OFFLINE POS RECEIPT</p>
          </div>

          <div className="py-2 space-y-0.5 text-[10px] border-b border-dashed border-slate-400">
            <div className="flex justify-between">
              <span className="text-slate-500">Receipt #:</span>
              <span className="font-bold">{sale.sale_number || sale.id.slice(0, 10)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date/Time:</span>
              <span>{formattedDate}</span>
            </div>
            {sale.cashier_name && (
              <div className="flex justify-between">
                <span className="text-slate-500">Cashier:</span>
                <span>{sale.cashier_name}</span>
              </div>
            )}
          </div>

          {/* Itemized Table */}
          <div className="py-3 border-b border-dashed border-slate-400 space-y-2">
            {sale.items && sale.items.length > 0 ? (
              sale.items.map((item, idx) => {
                const qty = item.qty_milli / 1000;
                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-bold text-[11px] text-slate-950 flex justify-between">
                      <span>{item.product_name_snapshot}</span>
                      <span>{formatCentavos(item.line_total_centavos)}</span>
                    </div>
                    <div className="text-[10px] text-slate-600 flex justify-between pl-2">
                      <span>
                        {qty} {item.unit_snapshot} @ {formatCentavos(item.unit_price_centavos)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-slate-500 italic py-2">Quick Sale Item</p>
            )}
          </div>

          {/* Totals Section */}
          <div className="py-3 space-y-1.5 border-b border-dashed border-slate-400">
            {sale.discount_centavos > 0 && (
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Discount:</span>
                <span>-{formatCentavos(sale.discount_centavos)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-sm text-slate-950 pt-1">
              <span>TOTAL DUE:</span>
              <span>{formatCentavos(sale.total_centavos)}</span>
            </div>

            {sale.payments && sale.payments.length > 0 && (
              <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px]">
                {sale.payments.map((p, pIdx) => (
                  <div key={pIdx} className="flex justify-between text-slate-700 font-bold">
                    <span className="capitalize">Paid ({p.method}):</span>
                    <span>{formatCentavos(p.amount_centavos)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Disclaimer */}
          <div className="pt-4 text-center space-y-1 text-[9px] text-slate-500">
            <p className="font-bold">{footerNote}</p>
            <p className="italic text-[8px]">Store Management Record • Non-BIR Official Receipt</p>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-[#121620] border-t border-slate-800/80 flex gap-2 print:hidden font-jakarta">
          <button
            onClick={handleCopyText}
            className="flex-1 bg-[#181d2a] border border-slate-800/80 hover:bg-[#222938] text-slate-200 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm font-jakarta"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#22c55e]" />
                <span className="text-[#22c55e]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition shadow-sm font-jakarta"
          >
            <Printer className="w-4 h-4" />
            <span>{config ? 'Print ESC/POS' : 'Print Receipt'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
