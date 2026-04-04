'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, Check, AlertCircle, Minus, Plus, Loader2 } from 'lucide-react';
import type { FlotCheckoutProps, OrderItem, CardData, ChargeResult } from '@/lib/types';
import { flotMock } from '@/lib/flot-mock';
import { usePaymentStore } from '@/store/paymentStore';
import CheckoutForm from './CheckoutForm';
import FlotCardFields from './FlotCardFields';
import SavedPaymentPrompt from './SavedPaymentPrompt';
import PoweredByFlot from './PoweredByFlot';
import Button from '@/components/ui/Button';
import Confetti from '@/components/motion/Confetti';
import { leonesOf } from '@/lib/currency';

// PRODUCTION INTEGRATION:
// 1. Load: <Script src="https://js.flot.com/v1/" strategy="beforeInteractive" />
// 2. Init: const flot = Flot(process.env.NEXT_PUBLIC_FLOT_KEY);
// 3. Mount card fields: flot.elements.card().mount('#flot-card-number');
// 4. On submit: const { token } = await flot.tokenize(cardElement);
// 5. POST { token, amount, currency, customer } to /api/pay
// 6. /api/pay calls Flot Charges API with secret key (server-side only)

type Step = 'review' | 'details' | 'payment' | 'processing' | 'success' | 'error';

interface CheckoutState {
  step: Step;
  formData: Record<string, string>;
  cardData: CardData;
  orderItems: OrderItem[];
  chargeResult: ChargeResult | null;
  errorMessage: string;
  token: string;
}

function calculateTotals(items: OrderItem[], vertical: FlotCheckoutProps['vertical']) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  let taxRate = 0.08; // default store
  let taxLabel = 'Tax (8%)';
  const fees: { label: string; amount: number }[] = [];

  if (vertical === 'hotel') {
    taxRate = 0.12;
    taxLabel = 'Tax (12%)';
    fees.push({ label: 'Resort Fee', amount: 45 });
  } else if (vertical === 'restaurant') {
    taxRate = 0;
    taxLabel = '';
    fees.push({ label: 'Service Charge (12.5%)', amount: subtotal * 0.125 });
  } else if (vertical === 'travel') {
    taxRate = 0.22;
    taxLabel = 'Taxes & Fees (22%)';
  }

  const tax = subtotal * taxRate;
  const feesTotal = fees.reduce((sum, f) => sum + f.amount, 0);
  const total = subtotal + tax + feesTotal;

  return { subtotal, tax, taxLabel, fees, total };
}

const steps: { key: Step; label: string }[] = [
  { key: 'review', label: 'Review' },
  { key: 'details', label: 'Details' },
  { key: 'payment', label: 'Payment' },
];

export default function FlotCheckout({
  brandName,
  accentColor,
  orderSummary,
  currency,
  vertical,
  extraFields,
  onSuccess,
  onError,
  onClose,
}: FlotCheckoutProps) {
  const savedPayment = usePaymentStore((s) => s.savedPayment);

  const [state, setState] = useState<CheckoutState>({
    step: 'review',
    formData: {},
    cardData: { number: '', expiry: '', cvv: '', name: '' },
    orderItems: orderSummary,
    chargeResult: null,
    errorMessage: '',
    token: '',
  });

  const { subtotal, tax, taxLabel, fees, total } = calculateTotals(state.orderItems, vertical);

  const setStep = (step: Step) => setState((s) => ({ ...s, step }));

  const updateQuantity = (id: string, delta: number) => {
    setState((s) => ({
      ...s,
      orderItems: s.orderItems
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0),
    }));
  };

  const handlePay = useCallback(async () => {
    setStep('processing');

    try {
      let token = state.token;

      if (!savedPayment) {
        const tokenResult = await flotMock.tokenize(state.cardData);
        token = tokenResult.token;
        setState((s) => ({ ...s, token }));
      }

      const result = await flotMock.charge({
        token: token || 'saved_token',
        amount: Math.round(total * 100),
        currency,
        customer: {
          email: state.formData.email || 'demo@flot.com',
          name: `${state.formData.firstName || 'Demo'} ${state.formData.lastName || 'User'}`,
        },
      });

      if (result.success) {
        setState((s) => ({ ...s, chargeResult: result, step: 'success' }));
        onSuccess(result);
      } else {
        setState((s) => ({
          ...s,
          errorMessage: result.error || 'Payment failed',
          step: 'error',
        }));
        onError(result.error || 'Payment failed');
      }
    } catch {
      setState((s) => ({
        ...s,
        errorMessage: 'An unexpected error occurred.',
        step: 'error',
      }));
      onError('An unexpected error occurred.');
    }
  }, [state.cardData, state.formData, state.token, savedPayment, total, currency, onSuccess, onError]);

  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll + ESC to close + focus trap
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !drawerRef.current) return;

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Auto-focus the drawer
    drawerRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const stepIndex = steps.findIndex((s) => s.key === state.step);
  const isTerminal = ['processing', 'success', 'error'].includes(state.step);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        ref={drawerRef}
        tabIndex={-1}
        className="relative w-full sm:max-w-[480px] h-full bg-[var(--ink)] border-l border-[var(--ash)] flex flex-col overflow-hidden outline-none"
        role="dialog"
        aria-modal="true"
        aria-label={`${brandName} Checkout`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--ash)]">
          <div className="flex items-center gap-3">
            {!isTerminal && stepIndex > 0 && (
              <button
                onClick={() => setStep(steps[stepIndex - 1].key)}
                className="text-[var(--fog)] hover:text-[var(--paper)] transition-colors cursor-pointer"
                aria-label="Go back"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="font-display text-[var(--text-md)] text-[var(--paper)] font-medium">
                {brandName}
              </h2>
              {!isTerminal && (
                <span className="text-[var(--text-xs)] font-mono text-[var(--fog)]">
                  Checkout
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--fog)] hover:text-[var(--paper)] transition-colors p-1 cursor-pointer"
            aria-label="Close checkout"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        {!isTerminal && (
          <div className="px-6 py-3 border-b border-[var(--ash)]/50">
            <div className="flex gap-1">
              {steps.map((s, i) => (
                <div key={s.key} className="flex-1 flex flex-col gap-1">
                  <div
                    className="h-[2px] rounded-full transition-colors duration-mid"
                    style={{
                      backgroundColor: i <= stepIndex ? accentColor : 'var(--ash)',
                    }}
                  />
                  <span
                    className="text-[10px] font-body uppercase tracking-wider transition-colors"
                    style={{
                      color: i <= stepIndex ? accentColor : 'var(--fog)',
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Review */}
            {state.step === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h3 className="text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.15em] mb-4" style={{ color: accentColor }}>
                  Order Summary
                </h3>
                <div className="space-y-3 mb-6">
                  {state.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-2 border-b border-[var(--ash)]/30">
                      {item.image && (
                        <div
                          className="w-12 h-12 rounded-sm bg-cover bg-center flex-shrink-0"
                          style={{ backgroundImage: `url(${item.image})` }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--text-sm)] font-body text-[var(--paper)] truncate">
                          {item.name}
                        </p>
                        {item.variant && (
                          <p className="text-[var(--text-xs)] text-[var(--fog)]">{item.variant}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded-sm bg-[var(--stone)] text-[var(--fog)] hover:text-[var(--paper)] transition-colors cursor-pointer"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-[var(--text-xs)] font-mono text-[var(--paper)] w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-sm bg-[var(--stone)] text-[var(--fog)] hover:text-[var(--paper)] transition-colors cursor-pointer"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="font-display text-[var(--text-sm)] text-[var(--paper)] w-auto text-right">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                        <span className="block text-[var(--text-xs)] text-[var(--fog)] font-mono">{leonesOf(item.unitPrice * item.quantity)}</span>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 py-4 border-t border-[var(--ash)]">
                  <div className="flex justify-between text-[var(--text-sm)]">
                    <span className="text-[var(--fog)]">Subtotal</span>
                    <span className="font-display text-[var(--paper)]">${subtotal.toFixed(2)} <span className="text-[var(--fog)] font-mono text-[var(--text-xs)]">({leonesOf(subtotal)})</span></span>
                  </div>
                  {fees.map((fee) => (
                    <div key={fee.label} className="flex justify-between text-[var(--text-sm)]">
                      <span className="text-[var(--fog)]">{fee.label}</span>
                      <span className="font-display text-[var(--paper)]">${fee.amount.toFixed(2)} <span className="text-[var(--fog)] font-mono text-[var(--text-xs)]">({leonesOf(fee.amount)})</span></span>
                    </div>
                  ))}
                  {taxLabel && (
                    <div className="flex justify-between text-[var(--text-sm)]">
                      <span className="text-[var(--fog)]">{taxLabel}</span>
                      <span className="font-display text-[var(--paper)]">${tax.toFixed(2)} <span className="text-[var(--fog)] font-mono text-[var(--text-xs)]">({leonesOf(tax)})</span></span>
                    </div>
                  )}
                  <div className="flex justify-between text-[var(--text-md)] pt-2 border-t border-[var(--ash)]">
                    <span className="font-body font-semibold text-[var(--paper)]">Total</span>
                    <span className="font-display font-bold text-[var(--paper)]" aria-live="polite" aria-atomic="true">${total.toFixed(2)} <span className="text-[var(--fog)] font-mono text-[var(--text-sm)]">({leonesOf(total)})</span></span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {state.step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <CheckoutForm
                  vertical={vertical}
                  extraFields={extraFields}
                  accentColor={accentColor}
                  formData={state.formData}
                  onFormChange={(data) => setState((s) => ({ ...s, formData: data }))}
                />
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {state.step === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {savedPayment ? (
                  <div className="space-y-4">
                    <div className="bg-[var(--stone)] border border-[var(--ash)] rounded-sm p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-sm flex items-center justify-center text-xs font-mono font-bold"
                          style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                        >
                          V
                        </div>
                        <div>
                          <p className="text-[var(--text-sm)] font-body text-[var(--paper)]">
                            Visa •••• {savedPayment.last4}
                          </p>
                          <p className="text-[var(--text-xs)] text-[var(--fog)]">
                            Expires {savedPayment.expiry}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          usePaymentStore.getState().clearPayment();
                          setState((s) => ({ ...s }));
                        }}
                        className="text-[var(--text-xs)] font-body uppercase tracking-wider hover:text-[var(--paper)] transition-colors cursor-pointer"
                        style={{ color: accentColor }}
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <FlotCardFields
                    onCardData={(data) => setState((s) => ({ ...s, cardData: data }))}
                    accentColor={accentColor}
                  />
                )}
              </motion.div>
            )}

            {/* Processing */}
            {state.step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="mb-6"
                >
                  <Loader2 size={40} style={{ color: accentColor }} />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-[var(--text-sm)] font-body text-[var(--cloud)]"
                >
                  Authorising payment…
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 1.2 }}
                  className="text-[var(--text-xs)] font-body text-[var(--fog)] mt-2"
                >
                  Confirming order…
                </motion.p>
              </motion.div>
            )}

            {/* Success */}
            {state.step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col items-center py-12"
              >
                {/* Confetti burst */}
                <Confetti accentColor={accentColor} count={35} />

                {/* Animated checkmark */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${accentColor}20` }}
                >
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                  >
                    <Check size={28} style={{ color: accentColor }} strokeWidth={3} />
                  </motion.div>
                </motion.div>

                <h3 className="font-display text-[var(--text-lg)] text-[var(--paper)] font-medium mb-2">
                  Payment Confirmed
                </h3>

                {state.chargeResult?.orderId && (
                  <p className="font-mono text-[var(--text-sm)] mb-6" style={{ color: accentColor }}>
                    {state.chargeResult.orderId}
                  </p>
                )}

                <p className="text-[var(--text-sm)] text-[var(--cloud)] text-center mb-8 max-w-xs">
                  {vertical === 'hotel' && 'Your reservation is confirmed. A confirmation email has been sent.'}
                  {vertical === 'restaurant' && 'Your order has been sent to the kitchen. Enjoy your meal!'}
                  {vertical === 'travel' && 'Your booking is confirmed. E-tickets have been sent to your email.'}
                  {vertical === 'store' && 'Your order is being prepared. You\'ll receive tracking details soon.'}
                </p>

                {/* Saved payment prompt */}
                {!usePaymentStore.getState().savedPayment && (
                  <SavedPaymentPrompt
                    last4={state.cardData.number.slice(-4) || '4242'}
                    token={state.token}
                    accentColor={accentColor}
                    onDone={onClose}
                  />
                )}
              </motion.div>
            )}

            {/* Error */}
            {state.step === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-[var(--error)]/10 flex items-center justify-center mb-6">
                  <AlertCircle size={28} className="text-[var(--error)]" />
                </div>
                <h3 className="font-display text-[var(--text-lg)] text-[var(--paper)] font-medium mb-2">
                  Payment Failed
                </h3>
                <p className="text-[var(--text-sm)] text-[var(--cloud)] text-center mb-8 max-w-xs">
                  {state.errorMessage}
                </p>
                <div className="flex gap-3">
                  <Button variant="accent" size="sm" accentColor={accentColor} onClick={() => setStep('payment')}>
                    Try Again
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setState((s) => ({ ...s, cardData: { number: '', expiry: '', cvv: '', name: '' } }));
                      setStep('payment');
                    }}
                  >
                    Use Different Card
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer CTA */}
        {!isTerminal && (
          <div className="px-6 py-4 border-t border-[var(--ash)] bg-[var(--ink)] safe-bottom">
            {state.step === 'review' && (
              <Button
                variant="accent"
                size="lg"
                accentColor={accentColor}
                className="w-full"
                onClick={() => setStep('details')}
                disabled={state.orderItems.length === 0}
              >
                Continue to Details
              </Button>
            )}
            {state.step === 'details' && (
              <Button
                variant="accent"
                size="lg"
                accentColor={accentColor}
                className="w-full"
                onClick={() => setStep('payment')}
              >
                Continue to Payment
              </Button>
            )}
            {state.step === 'payment' && (
              <Button
                variant="accent"
                size="lg"
                accentColor={accentColor}
                className="w-full"
                onClick={handlePay}
              >
                Pay ${total.toFixed(2)} ({leonesOf(total)})
              </Button>
            )}
            <PoweredByFlot />
          </div>
        )}
      </motion.div>
    </div>
  );
}
