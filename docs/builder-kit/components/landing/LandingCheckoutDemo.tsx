'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CreditCard, Lock, Smartphone, Wallet, Loader2, RotateCcw } from 'lucide-react';

type PaymentMethod = 'flot' | 'mobile-money' | 'card';
type Step = 'idle' | 'processing' | 'success';

/**
 * Interactive landing-page demo of the Flot checkout. Replaces what used to be
 * a static SVG-like mockup + a "Try Live Demo" button. The buyer can:
 *   - Tap a payment method row to select it
 *   - Tap Pay → simulated 1.5s processing → success state
 *   - Tap "Try again" to reset
 *
 * No real network — this is purely visual confidence-building so the visitor
 * understands what their customers will see. The real checkout link is at
 * pay.flotme.ai (linked separately on the landing page).
 */
export default function LandingCheckoutDemo() {
  const [selected, setSelected] = useState<PaymentMethod>('flot');
  const [step, setStep] = useState<Step>('idle');

  // Simulated processing → success transition.
  useEffect(() => {
    if (step !== 'processing') return;
    const t = setTimeout(() => setStep('success'), 1600);
    return () => clearTimeout(t);
  }, [step]);

  function pay() {
    if (step === 'idle') setStep('processing');
  }

  function reset() {
    setStep('idle');
    setSelected('flot');
  }

  const isProcessing = step === 'processing';
  const isSuccess = step === 'success';
  const isIdle = step === 'idle';

  return (
    <div className="w-full max-w-[380px]">
      {/* Card */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-[rgba(128,240,192,0.1)]">
        <div className="h-1" style={{ background: 'linear-gradient(90deg, var(--flot-grad-start), var(--flot-grad-end))' }} />
        <div className="p-6 relative">
          {/* Success overlay */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center px-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                  className="w-16 h-16 rounded-full bg-[var(--flot)] flex items-center justify-center mb-4"
                >
                  <Check size={32} className="text-white" strokeWidth={3} />
                </motion.div>
                <p className="text-xl font-bold text-gray-900 mb-1">Payment successful</p>
                <p className="text-xs text-gray-500 mb-5">Le 250.00 paid to Your Business</p>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw size={14} />
                  Try again
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="text-center mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-1">Paying to</p>
            <h3 className="text-lg font-bold text-gray-900">Your Business</h3>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/flot-logo.png" alt="Flot" className="w-4 h-4 rounded" />
              <span className="text-[10px] font-medium text-[var(--flot-dim)]">Verified Merchant</span>
            </div>
          </div>

          <div className="h-px bg-gray-100 my-4" />

          {/* Amount */}
          <div className="text-center mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2">Amount to Pay</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-base font-semibold text-[var(--flot-dim)]">Le</span>
              <span className="text-4xl font-bold text-gray-900 tracking-tight">250.00</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">USD 10.42</p>
          </div>

          <div className="h-px bg-gray-100 my-4" />

          {/* Payment methods — clickable */}
          <div className="space-y-2">
            <PaymentRow
              method="flot"
              label="Pay with Flot"
              hint="Instant, zero fees"
              icon={<Wallet size={18} className="text-white" />}
              iconBg="var(--flot)"
              selected={selected === 'flot'}
              onSelect={() => isIdle && setSelected('flot')}
              disabled={!isIdle}
            />
            <PaymentRow
              method="mobile-money"
              label="Mobile Money"
              hint={
                <div className="flex gap-1 mt-0.5">
                  <span className="text-[8px] font-bold text-orange-500 border border-orange-200 rounded px-1 py-px">ORANGE</span>
                  <span className="text-[8px] font-bold text-blue-600 border border-blue-200 rounded px-1 py-px">AFRIMONEY</span>
                </div>
              }
              icon={<Smartphone size={18} className="text-gray-500" />}
              iconBg="#e5e7eb"
              selected={selected === 'mobile-money'}
              onSelect={() => isIdle && setSelected('mobile-money')}
              disabled={!isIdle}
            />
            <PaymentRow
              method="card"
              label="Bank Card"
              hint={
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[8px] font-black italic text-blue-700">VISA</span>
                  <span className="relative w-3 h-3">
                    <span className="absolute inset-0 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-red-500 opacity-80" />
                      <span className="w-2 h-2 rounded-full bg-yellow-400 opacity-80 -ml-1" />
                    </span>
                  </span>
                </div>
              }
              icon={<CreditCard size={18} className="text-gray-500" />}
              iconBg="#e5e7eb"
              selected={selected === 'card'}
              onSelect={() => isIdle && setSelected('card')}
              disabled={!isIdle}
            />
          </div>

          {/* Pay button */}
          <button
            onClick={pay}
            disabled={!isIdle}
            className="w-full mt-5 py-3.5 rounded-2xl text-sm font-bold text-gray-900 bg-[var(--flot)] hover:bg-[var(--flot-dim)] active:scale-[0.99] transition-all disabled:cursor-default flex items-center justify-center gap-2"
            aria-busy={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing…
              </>
            ) : (
              <>Pay Le 250.00 ($10.42)</>
            )}
          </button>
        </div>
      </div>

      {/* Bottom badge */}
      <div className="mt-4 flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2">
          <Lock size={12} className="text-[var(--flot)]" />
          <span className="text-xs font-medium text-white/70">
            Secured by <span className="text-[var(--flot)] font-semibold">Flot</span>
          </span>
        </div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/20">
          Fast &bull; Secure &bull; Everywhere
        </p>
      </div>
    </div>
  );
}

interface PaymentRowProps {
  method: PaymentMethod;
  label: string;
  hint: React.ReactNode;
  icon: React.ReactNode;
  iconBg: string;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}

function PaymentRow({ label, hint, icon, iconBg, selected, disabled, onSelect }: PaymentRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
        selected
          ? 'border-2 border-[var(--flot)] bg-[var(--flot)]/10'
          : 'border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300'
      } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
      aria-pressed={selected}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-900">{label}</p>
        {typeof hint === 'string' ? (
          <p className="text-[10px] text-gray-500">{hint}</p>
        ) : (
          hint
        )}
      </div>
      {selected && (
        <div className="w-5 h-5 rounded-full bg-[var(--flot)]/20 flex items-center justify-center shrink-0">
          <Check size={12} className="text-[var(--flot)]" />
        </div>
      )}
    </button>
  );
}
