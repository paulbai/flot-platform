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
  requireAddress?: boolean;
  accentColor: string;
  onSubmit: (details: CustomerDetails) => void;
  onClose: () => void;
}

export default function CustomerDetailsModal({
  title = 'Your Details',
  subtitle,
  requireEmail = true,
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
    if (!form.phone.trim()) newErrors.phone = 'Required';
    if (requireAddress && !form.address?.trim()) newErrors.address = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit(form);
  };

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
          className="w-full max-w-md bg-[var(--ink)] border border-[var(--ash)] rounded-sm p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="font-display text-[var(--text-lg)] text-[var(--paper)] font-medium">{title}</h2>
              {subtitle && (
                <p className="text-[var(--text-xs)] text-[var(--fog)] font-body mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-[var(--fog)] hover:text-[var(--paper)] transition-colors cursor-pointer ml-4 mt-0.5"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[var(--text-xs)] font-body uppercase tracking-wider text-[var(--fog)] mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Amara Kamara"
                className="w-full bg-[var(--stone)] border rounded-sm px-3 py-2.5 text-[var(--text-sm)] font-body text-[var(--paper)] focus:outline-none transition-colors placeholder:text-[var(--fog)]/50"
                style={{ borderColor: errors.name ? 'var(--error)' : 'var(--ash)' }}
              />
              {errors.name && (
                <p className="text-[var(--text-xs)] text-[var(--error)] mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email — only when required (hotel flow). Restaurant/store delivery skips this. */}
            {requireEmail && (
              <div>
                <label className="block text-[var(--text-xs)] font-body uppercase tracking-wider text-[var(--fog)] mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full bg-[var(--stone)] border rounded-sm px-3 py-2.5 text-[var(--text-sm)] font-body text-[var(--paper)] focus:outline-none transition-colors placeholder:text-[var(--fog)]/50"
                  style={{ borderColor: errors.email ? 'var(--error)' : 'var(--ash)' }}
                />
                {errors.email && (
                  <p className="text-[var(--text-xs)] text-[var(--error)] mt-1">{errors.email}</p>
                )}
              </div>
            )}

            {/* Phone */}
            <div>
              <label className="block text-[var(--text-xs)] font-body uppercase tracking-wider text-[var(--fog)] mb-1.5">
                Phone *
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+232 76 000 000"
                className="w-full bg-[var(--stone)] border rounded-sm px-3 py-2.5 text-[var(--text-sm)] font-body text-[var(--paper)] focus:outline-none transition-colors placeholder:text-[var(--fog)]/50"
                style={{ borderColor: errors.phone ? 'var(--error)' : 'var(--ash)' }}
              />
              {errors.phone && (
                <p className="text-[var(--text-xs)] text-[var(--error)] mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Delivery Address */}
            {requireAddress && (
              <div>
                <label className="block text-[var(--text-xs)] font-body uppercase tracking-wider text-[var(--fog)] mb-1.5">
                  Delivery Address *
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street address, City"
                  rows={2}
                  className="w-full bg-[var(--stone)] border rounded-sm px-3 py-2.5 text-[var(--text-sm)] font-body text-[var(--paper)] focus:outline-none transition-colors resize-none placeholder:text-[var(--fog)]/50"
                  style={{ borderColor: errors.address ? 'var(--error)' : 'var(--ash)' }}
                />
                {errors.address && (
                  <p className="text-[var(--text-xs)] text-[var(--error)] mt-1">{errors.address}</p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="mt-6 w-full py-3 rounded-sm text-[var(--text-sm)] font-body font-semibold uppercase tracking-wider transition-opacity hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: accentColor, color: '#000' }}
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
