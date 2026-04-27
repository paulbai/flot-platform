'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { CustomerDetails } from '@/lib/orders/customer';

interface CustomerDetailsModalProps {
  title?: string;
  subtitle?: string;
  /**
   * Whether email is required + visible. Default `true` (hotel flow uses email
   * as the lookup key for the "My Reservations" drawer). Restaurant and store
   * delivery flows pass `false` to skip the email field entirely.
   */
  requireEmail?: boolean;
  /**
   * Whether phone is required + visible. Default `true` (most flows need a way
   * to contact the buyer). Dine-in passes `false` since the merchant just
   * needs a name to call out the order at the table.
   */
  requirePhone?: boolean;
  requireAddress?: boolean;
  accentColor: string;
  onSubmit: (details: CustomerDetails) => void;
  onClose: () => void;
}

// Explicit dark-mode palette for the modal — does NOT use the SiteRenderer's
// brand CSS variables. The modal renders inside the merchant-styled site root
// (which can set text color, fonts, etc. on every descendant); we lock the
// modal's colors so the form is always legible regardless of the brand.
const MODAL_BG          = '#0f0f10';
const MODAL_BORDER      = '#27272a'; // zinc-800
const INPUT_BG          = '#18181b'; // zinc-900
const INPUT_BORDER      = '#3f3f46'; // zinc-700
const INPUT_BORDER_FOCUS = '#71717a'; // zinc-500
const INPUT_BORDER_ERR  = '#ef4444'; // red-500

export default function CustomerDetailsModal({
  title = 'Your Details',
  subtitle,
  requireEmail = true,
  requirePhone = true,
  requireAddress = false,
  accentColor,
  onSubmit,
  onClose,
}: CustomerDetailsModalProps) {
  const [form, setForm] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof CustomerDetails, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Required';
    if (requireEmail && (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)))
      newErrors.email = 'Valid email required';
    if (requirePhone && !form.phone.trim()) newErrors.phone = 'Required';
    if (requireAddress && !form.address?.trim()) newErrors.address = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit(form);
  };

  const inputBaseClass =
    'w-full rounded-md px-3 py-2.5 text-sm font-normal text-white outline-none transition-colors placeholder:text-zinc-500';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          // colorScheme: 'dark' tells the browser to render input carets,
          // selection, and date pickers in dark-mode style — without this,
          // Chrome on Mac uses light defaults that look broken.
          style={{
            backgroundColor: MODAL_BG,
            borderColor: MODAL_BORDER,
            color: '#ffffff',
            colorScheme: 'dark',
          }}
          className="w-full max-w-md border rounded-xl p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              {subtitle && (
                <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer ml-4 mt-0.5"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onFocus={(e) => (e.currentTarget.style.borderColor = INPUT_BORDER_FOCUS)}
                onBlur={(e) => (e.currentTarget.style.borderColor = errors.name ? INPUT_BORDER_ERR : INPUT_BORDER)}
                placeholder="e.g. Amara Kamara"
                className={inputBaseClass}
                style={{
                  backgroundColor: INPUT_BG,
                  border: `1px solid ${errors.name ? INPUT_BORDER_ERR : INPUT_BORDER}`,
                }}
              />
              {errors.name && (
                <p className="text-xs text-red-400 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email — only when required (hotel flow). Restaurant/store delivery skips this. */}
            {requireEmail && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={(e) => (e.currentTarget.style.borderColor = INPUT_BORDER_FOCUS)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.email ? INPUT_BORDER_ERR : INPUT_BORDER)}
                  placeholder="you@example.com"
                  className={inputBaseClass}
                  style={{
                    backgroundColor: INPUT_BG,
                    border: `1px solid ${errors.email ? INPUT_BORDER_ERR : INPUT_BORDER}`,
                  }}
                />
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1">{errors.email}</p>
                )}
              </div>
            )}

            {/* Phone — only when required (hidden for dine-in). */}
            {requirePhone && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  onFocus={(e) => (e.currentTarget.style.borderColor = INPUT_BORDER_FOCUS)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.phone ? INPUT_BORDER_ERR : INPUT_BORDER)}
                  placeholder="+232 76 000 000"
                  className={inputBaseClass}
                  style={{
                    backgroundColor: INPUT_BG,
                    border: `1px solid ${errors.phone ? INPUT_BORDER_ERR : INPUT_BORDER}`,
                  }}
                />
                {errors.phone && (
                  <p className="text-xs text-red-400 mt-1">{errors.phone}</p>
                )}
              </div>
            )}

            {/* Delivery Address */}
            {requireAddress && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Delivery Address *
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  onFocus={(e) => (e.currentTarget.style.borderColor = INPUT_BORDER_FOCUS)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.address ? INPUT_BORDER_ERR : INPUT_BORDER)}
                  placeholder="Street address, City"
                  rows={2}
                  className={`${inputBaseClass} resize-none`}
                  style={{
                    backgroundColor: INPUT_BG,
                    border: `1px solid ${errors.address ? INPUT_BORDER_ERR : INPUT_BORDER}`,
                  }}
                />
                {errors.address && (
                  <p className="text-xs text-red-400 mt-1">{errors.address}</p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="mt-6 w-full py-3 rounded-md text-sm font-semibold uppercase tracking-wider transition-opacity hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: accentColor, color: '#000' }}
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
