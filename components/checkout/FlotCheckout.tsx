'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  AlertCircle,
  Loader2,
  CreditCard,
  Smartphone,
  Wallet,
  Lock,
  ChevronDown,
  Mail,
  MessageCircle,
} from 'lucide-react';
import type { FlotCheckoutProps, OrderItem, CardData } from '@/lib/types';
import { flotMock } from '@/lib/flot-mock';
import { usePaymentStore } from '@/store/paymentStore';

type Step = 'review' | 'payment' | 'processing' | 'success' | 'receipt' | 'error';
type PaymentMethod = 'flot' | 'mobile-money' | 'card';

function calculateTotals(items: OrderItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  return { subtotal, tax: 0, fees: [] as { label: string; amount: number }[], total: subtotal };
}

export default function FlotCheckout({
  brandName,
  accentColor: _accentColor,
  orderSummary,
  currency,
  vertical: _vertical,
  onSuccess,
  onError,
  onClose,
}: FlotCheckoutProps) {
  const savedPayment = usePaymentStore((s) => s.savedPayment);

  const [step, setStep] = useState<Step>('review');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    savedPayment?.method ?? 'flot'
  );
  const [orderItems] = useState<OrderItem[]>(orderSummary);
  const [cardData, setCardData] = useState<CardData>({ number: '', expiry: '', cvv: '', name: '' });
  const [, setChargeResult] = useState<unknown>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [token, setToken] = useState('');
  const [receiptMethod, setReceiptMethod] = useState<'email' | 'whatsapp' | null>(null);
  const [receiptValue, setReceiptValue] = useState('');
  const [receiptSent, setReceiptSent] = useState(false);
  const [showSaveCard, setShowSaveCard] = useState(false);
  const [savingCard, setSavingCard] = useState(false);
  const [cardSaved, setCardSaved] = useState(false);
  const [pendingResult, setPendingResult] = useState<unknown>(null);
  const savePayment = usePaymentStore((s) => s.savePayment);

  const { total } = calculateTotals(orderItems);
  const drawerRef = useRef<HTMLDivElement>(null);

  const handlePay = useCallback(async () => {
    setStep('processing');
    try {
      let t = token;
      if (!savedPayment && paymentMethod === 'card') {
        const tokenResult = await flotMock.tokenize(cardData);
        t = tokenResult.token;
        setToken(t);
      }
      const result = await flotMock.charge({
        token: t || 'flot_token',
        amount: Math.round(total * 100),
        currency,
        customer: { email: 'demo@flot.com', name: brandName },
      });
      if (result.success) {
        setChargeResult(result);
        setPendingResult(result);
        setStep('success');
        // Show save payment prompt if they don't have a saved payment method
        if (!savedPayment) {
          setShowSaveCard(true);
        }
      } else {
        setErrorMessage(result.error || 'Payment failed');
        setStep('error');
        onError(result.error || 'Payment failed');
      }
    } catch {
      setErrorMessage('An unexpected error occurred.');
      setStep('error');
      onError('An unexpected error occurred.');
    }
  }, [cardData, token, savedPayment, paymentMethod, total, currency, brandName, onSuccess, onError]);

  const handleSendReceipt = () => {
    setReceiptSent(true);
  };

  const handleSavePayment = async () => {
    setSavingCard(true);
    try {
      const result = await flotMock.savePaymentMethod(token || 'flot_token');
      if (result.saved) {
        if (paymentMethod === 'card') {
          const last4 = cardData.number.replace(/\s/g, '').slice(-4);
          savePayment({
            method: 'card',
            last4,
            brand: 'Visa',
            expiry: cardData.expiry,
            profileId: result.profileId,
          });
        } else if (paymentMethod === 'mobile-money') {
          savePayment({
            method: 'mobile-money',
            last4: '',
            brand: 'Mobile Money',
            expiry: '',
            profileId: result.profileId,
            provider: 'Orange',
          });
        } else {
          savePayment({
            method: 'flot',
            last4: '',
            brand: 'Flot',
            expiry: '',
            profileId: result.profileId,
            flotId: 'demo@flot.com',
          });
        }
        setCardSaved(true);
      }
    } finally {
      setSavingCard(false);
    }
  };

  const handleDone = () => {
    if (pendingResult) {
      onSuccess(pendingResult as Parameters<typeof onSuccess>[0]);
    }
    onClose();
  };

  // Lock body scroll + ESC
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const currencyCode = currency === 'SLE' ? 'Le' : currency;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#0d1117]/95"
        onClick={onClose}
      />

      {/* Checkout Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        ref={drawerRef}
        className="relative z-10 w-full max-w-[440px] mx-4 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-label={`${brandName} Checkout`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/40 hover:text-white transition-colors z-20"
          aria-label="Close checkout"
        >
          <X size={20} />
        </button>

        {/* White Card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]" style={{ fontFamily: 'var(--font-montserrat), Montserrat, sans-serif' }}>
          {/* Top accent bar */}
          <div className="h-1" style={{ background: `linear-gradient(90deg, #6ee7b7, #34d399)` }} />

          <div className="overflow-y-auto flex-1">
            <AnimatePresence mode="wait">
              {/* ═══ REVIEW STEP ═══ */}
              {step === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 sm:p-8"
                >
                  {/* Business header */}
                  <div className="text-center mb-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-1">
                      Paying to
                    </p>
                    <h2 className="text-xl font-bold text-gray-900">{brandName}</h2>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <img src="/flot-logo.svg" alt="Flot" className="w-5 h-5 rounded" />
                      <span className="text-xs font-medium text-emerald-600">Verified Merchant</span>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200 my-5" />

                  {/* Amount */}
                  <div className="text-center mb-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">
                      Amount to Pay
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <span className="text-xl font-semibold">{currencyCode}</span>
                        <ChevronDown size={16} />
                      </div>
                      <span className="text-5xl font-bold text-gray-900 tracking-tight">
                        {total.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      USD {(total / 24).toFixed(2)}
                    </p>
                  </div>

                  <div className="h-px bg-gray-200 my-5" />

                  {/* Order items (collapsed) */}
                  {orderItems.length > 0 && (
                    <div className="mb-5">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                        {orderItems.length} item{orderItems.length !== 1 ? 's' : ''}
                      </p>
                      <div className="space-y-2">
                        {orderItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between py-1.5">
                            <div className="flex items-center gap-3 min-w-0">
                              {item.image && (
                                <div className="w-8 h-8 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${item.image})` }} />
                              )}
                              <div className="min-w-0">
                                <p className="text-sm text-gray-800 truncate">{item.name}</p>
                                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-800">
                              {currencyCode} {(item.unitPrice * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="h-px bg-gray-200 my-4" />
                    </div>
                  )}

                  {/* Payment methods */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Select Payment Method</p>
                    <div className="space-y-3">
                      {/* Pay with Flot */}
                      <button
                        onClick={() => setPaymentMethod('flot')}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                          paymentMethod === 'flot'
                            ? 'border-emerald-400 bg-emerald-50'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          paymentMethod === 'flot' ? 'bg-emerald-400' : 'bg-gray-200'
                        }`}>
                          <Wallet size={22} className={paymentMethod === 'flot' ? 'text-white' : 'text-gray-500'} />
                        </div>
                        <div className="text-left flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-900">Pay with Flot</p>
                            {savedPayment?.method === 'flot' && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 rounded-full px-2 py-0.5">Saved</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">Instant, zero fees</p>
                        </div>
                        {paymentMethod === 'flot' && (
                          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Check size={16} className="text-emerald-500" />
                          </div>
                        )}
                      </button>

                      {/* Mobile Money */}
                      <button
                        onClick={() => setPaymentMethod('mobile-money')}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                          paymentMethod === 'mobile-money'
                            ? 'border-emerald-400 bg-emerald-50'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          paymentMethod === 'mobile-money' ? 'bg-emerald-400' : 'bg-gray-200'
                        }`}>
                          <Smartphone size={22} className={paymentMethod === 'mobile-money' ? 'text-white' : 'text-gray-500'} />
                        </div>
                        <div className="text-left flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-900">Mobile Money</p>
                            {savedPayment?.method === 'mobile-money' && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 rounded-full px-2 py-0.5">Saved</span>
                            )}
                          </div>
                          <div className="flex gap-2 mt-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500 border border-orange-200 rounded px-1.5 py-0.5">Orange</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 border border-blue-200 rounded px-1.5 py-0.5">Afrimoney</span>
                          </div>
                        </div>
                        {paymentMethod === 'mobile-money' && (
                          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Check size={16} className="text-emerald-500" />
                          </div>
                        )}
                      </button>

                      {/* Bank Card */}
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                          paymentMethod === 'card'
                            ? 'border-emerald-400 bg-emerald-50'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          paymentMethod === 'card' ? 'bg-emerald-400' : 'bg-gray-200'
                        }`}>
                          <CreditCard size={22} className={paymentMethod === 'card' ? 'text-white' : 'text-gray-500'} />
                        </div>
                        <div className="text-left flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-900">Bank Card</p>
                            {savedPayment?.method === 'card' && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 rounded-full px-2 py-0.5">•••• {savedPayment.last4}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-black italic text-blue-700">VISA</span>
                            <span className="w-4 h-4 relative">
                              <span className="absolute inset-0 flex items-center">
                                <span className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                                <span className="w-3 h-3 rounded-full bg-yellow-400 opacity-80 -ml-1.5" />
                              </span>
                            </span>
                          </div>
                        </div>
                        {paymentMethod === 'card' && (
                          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Check size={16} className="text-emerald-500" />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Card fields (inline when card selected) */}
                  {paymentMethod === 'card' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 overflow-hidden"
                    >
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Card Number"
                          value={cardData.number}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                            const formatted = val.replace(/(\d{4})/g, '$1 ').trim();
                            setCardData((d) => ({ ...d, number: formatted }));
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none"
                        />
                        <div className="flex gap-3">
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardData.expiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                              if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
                              setCardData((d) => ({ ...d, expiry: val }));
                            }}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none"
                          />
                          <input
                            type="text"
                            placeholder="CVV"
                            value={cardData.cvv}
                            onChange={(e) => setCardData((d) => ({ ...d, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                            className="w-24 px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Cardholder Name"
                          value={cardData.name}
                          onChange={(e) => setCardData((d) => ({ ...d, name: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Pay button */}
                  <button
                    onClick={handlePay}
                    disabled={orderItems.length === 0}
                    className="w-full mt-6 py-4 rounded-2xl text-base font-bold text-gray-900 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#6ee7b7' }}
                  >
                    Pay {currencyCode} {total.toFixed(2)} (${(total / 24).toFixed(2)})
                  </button>
                </motion.div>
              )}

              {/* ═══ PROCESSING ═══ */}
              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 px-8"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="mb-6"
                  >
                    <Loader2 size={48} className="text-emerald-400" />
                  </motion.div>
                  <p className="text-sm text-gray-600 font-medium">Processing payment...</p>
                  <p className="text-xs text-gray-400 mt-1">Please wait</p>
                </motion.div>
              )}

              {/* ═══ SUCCESS ═══ */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="p-6 sm:p-8"
                >
                  {/* Top bar */}
                  <div className="h-1 -mt-6 sm:-mt-8 -mx-6 sm:-mx-8 mb-6" style={{ background: 'linear-gradient(90deg, #6ee7b7, #34d399)' }} />

                  <div className="text-center">
                    {/* Checkmark */}
                    <div className="relative mx-auto w-24 h-24 mb-6">
                      <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-20" />
                      <div className="absolute inset-2 rounded-full bg-emerald-50" />
                      <div className="relative w-full h-full rounded-full bg-emerald-400 flex items-center justify-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                        >
                          <Check size={40} className="text-white" strokeWidth={3} />
                        </motion.div>
                      </div>
                    </div>

                    <h3 className="text-3xl font-black text-gray-900 mb-2">
                      Payment<br />Successful
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Your payment of <span className="font-bold text-gray-900">{currencyCode} {total.toFixed(2)}</span><br />
                      has been processed.
                    </p>

                    {/* Receipt option */}
                    {!receiptSent && (
                      <div className="mb-6">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                          Receive your receipt via
                        </p>
                        <div className="flex gap-2 mb-3">
                          <button
                            onClick={() => setReceiptMethod('email')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                              receiptMethod === 'email'
                                ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <Mail size={16} />
                            Email
                          </button>
                          <button
                            onClick={() => setReceiptMethod('whatsapp')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                              receiptMethod === 'whatsapp'
                                ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <MessageCircle size={16} />
                            WhatsApp
                          </button>
                        </div>
                        {receiptMethod && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="overflow-hidden"
                          >
                            <div className="flex gap-2">
                              <input
                                type={receiptMethod === 'email' ? 'email' : 'tel'}
                                placeholder={receiptMethod === 'email' ? 'Enter email address' : 'Enter WhatsApp number'}
                                value={receiptValue}
                                onChange={(e) => setReceiptValue(e.target.value)}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 outline-none"
                              />
                              <button
                                onClick={handleSendReceipt}
                                disabled={!receiptValue.trim()}
                                className="px-4 py-3 rounded-xl bg-emerald-400 text-white text-sm font-semibold disabled:opacity-40 hover:bg-emerald-500 transition-colors"
                              >
                                Send
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {receiptSent && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-6 flex items-center justify-center gap-2 text-sm text-emerald-600"
                      >
                        <Check size={16} />
                        <span>Receipt sent to {receiptValue}</span>
                      </motion.div>
                    )}

                    {/* Save payment method */}
                    {showSaveCard && !cardSaved && (
                      <div className="mb-6 p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <span className="text-sm">⚡</span>
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-gray-900">Save for faster checkout</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {paymentMethod === 'card'
                                ? `Save your card •••• ${cardData.number.replace(/\s/g, '').slice(-4)} to your Flot profile for one-tap checkout.`
                                : paymentMethod === 'mobile-money'
                                ? 'Save your mobile money account to your Flot profile for one-tap checkout next time.'
                                : 'Save your Flot account for one-tap checkout across all Flot-powered stores.'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSavePayment}
                            disabled={savingCard}
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-50"
                          >
                            {savingCard
                              ? 'Saving...'
                              : paymentMethod === 'card'
                              ? 'Save my card'
                              : paymentMethod === 'mobile-money'
                              ? 'Save mobile money'
                              : 'Save Flot account'}
                          </button>
                          <button
                            onClick={() => setShowSaveCard(false)}
                            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            No thanks
                          </button>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-gray-400">
                          <Lock size={10} />
                          <span>Stored securely by Flot. We never share your data.</span>
                        </div>
                      </div>
                    )}

                    {cardSaved && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-6 flex items-center justify-center gap-2 text-sm text-emerald-600"
                      >
                        <Check size={16} />
                        <span>
                          {paymentMethod === 'card'
                            ? "Card saved! You'll check out faster next time."
                            : paymentMethod === 'mobile-money'
                            ? "Mobile money saved! You'll check out faster next time."
                            : "Flot account saved! One-tap checkout is ready."}
                        </span>
                      </motion.div>
                    )}

                    {/* Show saved payment badge if they already had one */}
                    {savedPayment && !showSaveCard && !cardSaved && (
                      <div className="mb-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                        {savedPayment.method === 'card' ? (
                          <CreditCard size={14} />
                        ) : savedPayment.method === 'mobile-money' ? (
                          <Smartphone size={14} />
                        ) : (
                          <Wallet size={14} />
                        )}
                        <span>
                          {savedPayment.method === 'card'
                            ? `Paid with saved card •••• ${savedPayment.last4}`
                            : savedPayment.method === 'mobile-money'
                            ? `Paid with saved ${savedPayment.provider || 'Mobile Money'}`
                            : 'Paid with saved Flot account'}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={handleDone}
                      className="w-full py-4 rounded-2xl text-base font-bold text-gray-900 transition-all hover:opacity-90"
                      style={{ backgroundColor: '#6ee7b7' }}
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ═══ ERROR ═══ */}
              {step === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 sm:p-8"
                >
                  <div className="text-center">
                    <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
                      <AlertCircle size={36} className="text-red-500" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Payment Failed</h3>
                    <p className="text-sm text-gray-500 mb-8">{errorMessage}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep('review')}
                        className="flex-1 py-3.5 rounded-2xl text-sm font-bold bg-emerald-400 text-gray-900 hover:opacity-90 transition-opacity"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom badge */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5">
            <Lock size={14} className="text-emerald-400" />
            <span className="text-sm font-medium text-white/80">
              Secured by <span className="text-emerald-400 font-semibold">Flot</span>
            </span>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/30">
            Fast &bull; Secure &bull; Everywhere
          </p>
          <p className="text-[10px] text-white/20">
            Powered by Open Hub &nbsp;|&nbsp; PCIDSS Compliant
          </p>
        </div>
      </motion.div>
    </div>
  );
}
