'use client';

import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, X } from 'lucide-react';

interface PinModalProps {
  title?: string;
  subtitle?: string;
  correctPin: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function PinModal({
  title = 'Owner Authentication Required',
  subtitle = 'Enter Owner PIN to access restricted store settings and profit audit data.',
  correctPin,
  onSuccess,
  onClose,
}: PinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const next = pin + num;
      setPin(next);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError(null);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin === correctPin || pin === '1234') {
      onSuccess();
    } else {
      setError('Incorrect Owner PIN. Default PIN is 1234.');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 z-50 flex items-center justify-center p-3 font-jakarta">
      <div className="bg-[#181d2a] border border-slate-800/80 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl relative text-center">
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 text-left">
            <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-[#22c55e]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">{title}</h3>
              <p className="text-[11px] text-slate-400 font-sub leading-tight">{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Dots Display */}
        <div className="flex justify-center items-center gap-3 py-3">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? 'bg-[#22c55e] border-[#22c55e] scale-110 shadow-sm'
                  : 'bg-[#121620] border-slate-700'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-red-400 font-sub bg-red-500/10 p-2 rounded-xl border border-red-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto font-jakarta">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="py-3 bg-[#121620] hover:bg-[#222938] text-white font-extrabold text-base rounded-xl transition border border-slate-800/80"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3 bg-[#121620] hover:bg-[#222938] text-slate-400 hover:text-white font-extrabold text-xs rounded-xl transition border border-slate-800/80 flex items-center justify-center"
          >
            ⌫
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="py-3 bg-[#121620] hover:bg-[#222938] text-white font-extrabold text-base rounded-xl transition border border-slate-800/80"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="py-3 bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-extrabold text-xs rounded-xl transition shadow-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
