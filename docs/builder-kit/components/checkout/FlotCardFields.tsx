'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';

interface FlotCardFieldsProps {
  onCardData: (data: { number: string; expiry: string; cvv: string; name: string }) => void;
  accentColor: string;
  disabled?: boolean;
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

export default function FlotCardFields({ onCardData, accentColor, disabled }: FlotCardFieldsProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const handleChange = (field: string, value: string) => {
    let num = cardNumber;
    let exp = expiry;
    let cv = cvv;
    let name = cardName;

    if (field === 'number') { num = value; setCardNumber(value); }
    if (field === 'expiry') { exp = value; setExpiry(value); }
    if (field === 'cvv') { cv = value; setCvv(value); }
    if (field === 'name') { name = value; setCardName(value); }

    onCardData({ number: num.replace(/\s/g, ''), expiry: exp, cvv: cv, name });
  };

  const inputClass = `
    w-full bg-[var(--stone)] border border-[var(--ash)] rounded-sm px-4 py-3
    text-[var(--text-sm)] font-body text-[var(--paper)] placeholder:text-[var(--fog)]
    focus:border-[var(--cloud)] focus:outline-none focus:ring-1
    transition-colors duration-mid disabled:opacity-40
  `;

  return (
    <div className="space-y-4">
      {/* Card header */}
      <div className="flex items-center gap-2 mb-1">
        <CreditCard size={16} style={{ color: accentColor }} />
        <span className="text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.15em] text-[var(--cloud)]">
          Secure Payment &middot; Protected by Flot
        </span>
      </div>

      {/* Cardholder name */}
      <div>
        <label htmlFor="card-name" className="block text-[var(--text-xs)] font-body text-[var(--fog)] mb-1.5 uppercase tracking-wider">
          Cardholder Name
        </label>
        <input
          id="card-name"
          type="text"
          placeholder="Name on card"
          value={cardName}
          onChange={(e) => handleChange('name', e.target.value)}
          disabled={disabled}
          className={inputClass}
          style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
        />
      </div>

      {/* Card number */}
      <div>
        <label htmlFor="card-number" className="block text-[var(--text-xs)] font-body text-[var(--fog)] mb-1.5 uppercase tracking-wider">
          Card Number
        </label>
        <input
          id="card-number"
          type="text"
          inputMode="numeric"
          placeholder="4242 4242 4242 4242"
          value={formatCardNumber(cardNumber)}
          onChange={(e) => handleChange('number', formatCardNumber(e.target.value))}
          disabled={disabled}
          className={inputClass}
          style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
        />
      </div>

      {/* Expiry + CVV row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="card-expiry" className="block text-[var(--text-xs)] font-body text-[var(--fog)] mb-1.5 uppercase tracking-wider">
            Expiry
          </label>
          <input
            id="card-expiry"
            type="text"
            inputMode="numeric"
            placeholder="MM/YY"
            value={formatExpiry(expiry)}
            onChange={(e) => handleChange('expiry', formatExpiry(e.target.value))}
            disabled={disabled}
            className={inputClass}
            style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
          />
        </div>
        <div>
          <label htmlFor="card-cvv" className="block text-[var(--text-xs)] font-body text-[var(--fog)] mb-1.5 uppercase tracking-wider">
            CVV
          </label>
          <input
            id="card-cvv"
            type="text"
            inputMode="numeric"
            placeholder="123"
            value={cvv}
            onChange={(e) => handleChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
            disabled={disabled}
            className={inputClass}
            style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Alternative payment methods (visual only) */}
      <div className="flex items-center gap-3 pt-2">
        <div className="h-[1px] flex-1 bg-[var(--ash)]" />
        <span className="text-[var(--text-xs)] font-body text-[var(--fog)]">or pay with</span>
        <div className="h-[1px] flex-1 bg-[var(--ash)]" />
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          disabled
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--stone)] border border-[var(--ash)] rounded-sm text-[var(--text-xs)] font-body text-[var(--fog)] opacity-50 cursor-not-allowed"
        >
          Apple Pay
        </button>
        <button
          type="button"
          disabled
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--stone)] border border-[var(--ash)] rounded-sm text-[var(--text-xs)] font-body text-[var(--fog)] opacity-50 cursor-not-allowed"
        >
          Google Pay
        </button>
      </div>
    </div>
  );
}
