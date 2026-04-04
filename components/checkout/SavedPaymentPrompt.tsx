'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Check } from 'lucide-react';
import { flotMock } from '@/lib/flot-mock';
import { usePaymentStore } from '@/store/paymentStore';
import Button from '@/components/ui/Button';

interface SavedPaymentPromptProps {
  last4: string;
  token: string;
  accentColor: string;
  onDone: () => void;
}

export default function SavedPaymentPrompt({ last4, token, accentColor, onDone }: SavedPaymentPromptProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savePayment = usePaymentStore((s) => s.savePayment);

  const handleSave = async () => {
    setSaving(true);
    const result = await flotMock.savePaymentMethod(token);
    if (result.saved) {
      savePayment({
        last4,
        brand: 'Visa',
        expiry: '12/27',
        profileId: result.profileId,
      });
      setSaved(true);
      setTimeout(onDone, 1500);
    }
    setSaving(false);
  };

  if (saved) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--stone)] border border-[var(--ash)] rounded-sm p-6 text-center"
      >
        <div
          className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <Check size={20} style={{ color: accentColor }} />
        </div>
        <p className="text-[var(--text-sm)] font-body text-[var(--paper)]">
          Saved! You&apos;ll check out faster next time.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--stone)] border border-[var(--ash)] rounded-sm p-6"
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <span className="text-sm">⚡</span>
        </div>
        <div>
          <h4 className="text-[var(--text-sm)] font-body font-semibold text-[var(--paper)] mb-1">
            Save for faster checkout
          </h4>
          <p className="text-[var(--text-xs)] text-[var(--cloud)] leading-relaxed">
            Save your Visa •••• {last4} to your Flot profile and check out in one
            tap across any Flot-powered store.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="accent"
          size="sm"
          accentColor={accentColor}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save my card'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onDone}>
          No thanks
        </Button>
      </div>

      <div className="flex items-center gap-1.5 mt-4 text-[var(--text-xs)] font-body text-[var(--fog)]">
        <Shield size={10} />
        <span>Stored securely by Flot. We never share your data.</span>
      </div>
    </motion.div>
  );
}
