'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, AlertCircle, Scan, Keyboard } from 'lucide-react';

interface BarcodeScannerModalProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
  title?: string;
}

export function BarcodeScannerModal({
  onScanSuccess,
  onClose,
  title = 'Scan Product Barcode',
}: BarcodeScannerModalProps) {
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    // Dynamically import html5-qrcode on client side only
    import('html5-qrcode').then(({ Html5QrcodeScanner, Html5QrcodeSupportedFormats }) => {
      if (!isMounted) return;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 160 },
        rememberLastUsedCamera: true,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
      };

      const scanner = new Html5QrcodeScanner('barcode-reader', config, /* verbose= */ false);
      scannerRef.current = scanner;

      scanner.render(
        (decodedText: string) => {
          if (decodedText) {
            scanner.clear().catch(console.error);
            onScanSuccess(decodedText);
          }
        },
        (_errorMessage: string) => {
          // Ignore constant scanning frame errors
        }
      );
    }).catch((err) => {
      console.error('Failed to load barcode scanner:', err);
      if (isMounted) setScanError('Failed to initialize camera scanner');
    });

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScanSuccess]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
      onScanSuccess(manualBarcode.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3">
      <div className="bg-[#0a0c14] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col space-y-4 p-5 relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h3 className="font-bold text-white text-base font-mono">{title}</h3>
          </div>
          <button
            onClick={() => {
              if (scannerRef.current) scannerRef.current.clear().catch(console.error);
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Scanner Viewport Container */}
        <div className="bg-[#05060a] border border-slate-800 rounded-xl p-2 relative overflow-hidden min-h-[260px] flex flex-col items-center justify-center">
          <div id="barcode-reader" className="w-full font-mono text-xs text-slate-300" />
        </div>

        {/* Manual Fallback Input */}
        <form onSubmit={handleManualSubmit} className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5 text-slate-500" />
            <span>Or Enter Barcode Manually</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 4800016009012"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              className="flex-1 bg-[#0d111c] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!manualBarcode.trim()}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs font-mono px-4 py-2 rounded-xl transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
