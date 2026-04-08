'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, ArrowRight, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { signIn } from 'next-auth/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'input' | 'code'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPhone('');
      setCode('');
      setStep('input');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  // Focus code input when entering step 2
  useEffect(() => {
    if (step === 'code' && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [step]);

  const displayIdentifier = mode === 'email' ? email : phone;

  function isValidInput() {
    if (mode === 'email') {
      return email && email.includes('@');
    }
    // E.164: +<country code><number>, min 7 digits total
    return phone && /^\+[1-9]\d{6,14}$/.test(phone);
  }

  async function handleSendOtp() {
    if (!isValidInput()) {
      setError(mode === 'email' ? 'Please enter a valid email' : 'Please enter a valid phone number (e.g. +1234567890)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = mode === 'email' ? { email } : { phone };
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send code. Please try again.');
      } else {
        setStep('code');
        setCode('');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', {
        ...(mode === 'email' ? { email } : { phone }),
        code,
        redirect: false as const,
      });
      if (result?.error) {
        setError('Invalid or expired code. Please try again.');
      } else {
        onSuccess();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    setError('');
    setLoading(true);
    try {
      const payload = mode === 'email' ? { email } : { phone };
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to resend code.');
      } else {
        setError('');
        setCode('');
      }
    } catch {
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setStep('input');
    setCode('');
    setError('');
  }

  function switchMode(newMode: 'email' | 'phone') {
    setMode(newMode);
    setError('');
    setEmail('');
    setPhone('');
  }

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-[calc(100%-2rem)] max-w-[420px] mx-auto"
          >
            <div className="bg-[#222] border border-[#444] rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
              {/* Top accent */}
              <div className="h-1 bg-gradient-to-r from-[var(--flot)] to-emerald-400" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-[var(--fog)] hover:text-white transition-colors z-10"
              >
                <X size={18} />
              </button>

              <div className="p-8">
                {step === 'input' ? (
                  <>
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 rounded-xl bg-[var(--flot)]/10 flex items-center justify-center mx-auto mb-4">
                        {mode === 'email' ? (
                          <Mail size={24} className="text-[var(--flot)]" />
                        ) : (
                          <Phone size={24} className="text-[var(--flot)]" />
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-white font-display mb-2">
                        Get Started
                      </h2>
                      <p className="text-sm text-[var(--fog)]">
                        {mode === 'email'
                          ? 'Enter your email to create your free business page'
                          : 'Enter your phone number to get started'}
                      </p>
                    </div>

                    {/* Email / Phone Toggle */}
                    <div className="flex bg-white/5 rounded-xl p-1 mb-5">
                      <button
                        onClick={() => switchMode('email')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all ${
                          mode === 'email'
                            ? 'bg-[var(--flot)] text-[var(--void)]'
                            : 'text-[var(--fog)] hover:text-white'
                        }`}
                      >
                        <Mail size={14} />
                        Email
                      </button>
                      <button
                        onClick={() => switchMode('phone')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all ${
                          mode === 'phone'
                            ? 'bg-[var(--flot)] text-[var(--void)]'
                            : 'text-[var(--fog)] hover:text-white'
                        }`}
                      >
                        <Phone size={14} />
                        Phone
                      </button>
                    </div>

                    {/* Input */}
                    <div className="space-y-4">
                      {mode === 'email' ? (
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setError(''); }}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                          placeholder="you@example.com"
                          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-[var(--ash)]/30 text-white placeholder:text-[var(--fog)]/50 text-sm focus:border-[var(--flot)] focus:ring-1 focus:ring-[var(--flot)] outline-none transition-all"
                          autoFocus
                        />
                      ) : (
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value); setError(''); }}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                          placeholder="+1 234 567 8900"
                          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-[var(--ash)]/30 text-white placeholder:text-[var(--fog)]/50 text-sm focus:border-[var(--flot)] focus:ring-1 focus:ring-[var(--flot)] outline-none transition-all"
                          autoFocus
                        />
                      )}

                      {error && (
                        <p className="text-xs text-red-400 text-center">{error}</p>
                      )}

                      <button
                        onClick={handleSendOtp}
                        disabled={loading || (mode === 'email' ? !email : !phone)}
                        className="w-full py-3.5 rounded-xl text-sm font-bold text-[var(--void)] bg-[var(--flot)] hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            Continue
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Header */}
                    <div className="text-center mb-8">
                      <div className="w-14 h-14 rounded-xl bg-[var(--flot)]/10 flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={24} className="text-[var(--flot)]" />
                      </div>
                      <h2 className="text-xl font-bold text-white font-display mb-2">
                        {mode === 'email' ? 'Check your email' : 'Check your phone'}
                      </h2>
                      <p className="text-sm text-[var(--fog)]">
                        We sent a 6-digit code to{' '}
                        <span className="text-white font-medium">{displayIdentifier}</span>
                      </p>
                    </div>

                    {/* Code input */}
                    <div className="space-y-4">
                      <input
                        ref={codeInputRef}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={code}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setCode(val);
                          setError('');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                        placeholder="000000"
                        className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-[var(--ash)]/30 text-white placeholder:text-[var(--fog)]/50 text-center text-2xl font-mono tracking-[0.3em] focus:border-[var(--flot)] focus:ring-1 focus:ring-[var(--flot)] outline-none transition-all"
                      />

                      {error && (
                        <p className="text-xs text-red-400 text-center">{error}</p>
                      )}

                      <button
                        onClick={handleVerifyCode}
                        disabled={loading || code.length !== 6}
                        className="w-full py-3.5 rounded-xl text-sm font-bold text-[var(--void)] bg-[var(--flot)] hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            Verify
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-between">
                        <button
                          onClick={handleBack}
                          className="text-xs text-[var(--fog)] hover:text-white transition-colors flex items-center gap-1"
                        >
                          <ArrowLeft size={12} />
                          Back
                        </button>
                        <button
                          onClick={handleResendCode}
                          disabled={loading}
                          className="text-xs text-[var(--fog)] hover:text-[var(--flot)] transition-colors disabled:opacity-40"
                        >
                          Resend code
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
