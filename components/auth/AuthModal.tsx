'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail('');
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

  async function handleSignIn() {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', {
        email,
        redirect: false,
      });
      if (result?.error) {
        setError('Something went wrong. Please try again.');
      } else {
        onSuccess();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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
            className="relative z-10 w-full max-w-[420px] mx-4"
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
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-xl bg-[var(--flot)]/10 flex items-center justify-center mx-auto mb-4">
                    <Mail size={24} className="text-[var(--flot)]" />
                  </div>
                  <h2 className="text-xl font-bold text-white font-display mb-2">
                    Get Started
                  </h2>
                  <p className="text-sm text-[var(--fog)]">
                    Enter your email to create your free business page
                  </p>
                </div>

                {/* Email input */}
                <div className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-[var(--ash)]/30 text-white placeholder:text-[var(--fog)]/50 text-sm focus:border-[var(--flot)] focus:ring-1 focus:ring-[var(--flot)] outline-none transition-all"
                    autoFocus
                  />

                  {error && (
                    <p className="text-xs text-red-400 text-center">{error}</p>
                  )}

                  <button
                    onClick={handleSignIn}
                    disabled={loading || !email}
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
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
