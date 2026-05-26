'use client';

import { MessageCircle, Mail } from 'lucide-react';
import type { Vertical, ExtraField } from '@/lib/types';

interface CheckoutFormProps {
  vertical: Vertical;
  extraFields?: ExtraField[];
  accentColor: string;
  formData: Record<string, string>;
  onFormChange: (data: Record<string, string>) => void;
}

export default function CheckoutForm({ vertical, extraFields, accentColor, formData, onFormChange }: CheckoutFormProps) {
  const updateField = (name: string, value: string) => {
    onFormChange({ ...formData, [name]: value });
  };

  const inputClass = `
    w-full bg-[var(--stone)] border border-[var(--ash)] rounded-sm px-4 py-3
    text-[var(--text-sm)] font-body text-[var(--paper)] placeholder:text-[var(--fog)]
    focus:border-[var(--cloud)] focus:outline-none focus:ring-1
    transition-colors duration-mid
  `;

  const labelClass = 'block text-[var(--text-xs)] font-body text-[var(--fog)] mb-1.5 uppercase tracking-wider';

  const receiptMethod = formData.receiptMethod || 'email';

  return (
    <div className="space-y-4">
      {/* Contact */}
      <div>
        <h3 className="text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: accentColor }}>
          Contact
        </h3>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@email.com"
            value={formData.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
            className={inputClass}
            style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Receipt delivery method */}
      <div>
        <h3 className="text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: accentColor }}>
          Receipt Delivery
        </h3>
        <p className="text-[var(--text-xs)] text-[var(--fog)] mb-3">
          How would you like to receive your receipt?
        </p>
        <div className="grid grid-cols-2 gap-2 mb-3" role="radiogroup" aria-label="Receipt delivery method">
          <button
            type="button"
            onClick={() => updateField('receiptMethod', 'whatsapp')}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-sm border text-[var(--text-xs)] font-body font-semibold uppercase tracking-wider transition-all duration-mid cursor-pointer"
            style={{
              borderColor: receiptMethod === 'whatsapp' ? accentColor : 'var(--ash)',
              backgroundColor: receiptMethod === 'whatsapp' ? `${accentColor}15` : 'var(--stone)',
              color: receiptMethod === 'whatsapp' ? accentColor : 'var(--cloud)',
            }}
            role="radio"
            aria-checked={receiptMethod === 'whatsapp'}
          >
            <MessageCircle size={14} />
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => updateField('receiptMethod', 'email')}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-sm border text-[var(--text-xs)] font-body font-semibold uppercase tracking-wider transition-all duration-mid cursor-pointer"
            style={{
              borderColor: receiptMethod === 'email' ? accentColor : 'var(--ash)',
              backgroundColor: receiptMethod === 'email' ? `${accentColor}15` : 'var(--stone)',
              color: receiptMethod === 'email' ? accentColor : 'var(--cloud)',
            }}
            role="radio"
            aria-checked={receiptMethod === 'email'}
          >
            <Mail size={14} />
            Email
          </button>
        </div>
        <div>
          {receiptMethod === 'whatsapp' ? (
            <>
              <label htmlFor="receiptPhone" className={labelClass}>WhatsApp Number</label>
              <input
                id="receiptPhone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.receiptPhone || ''}
                onChange={(e) => updateField('receiptPhone', e.target.value)}
                className={inputClass}
                style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
              />
            </>
          ) : (
            <>
              <label htmlFor="receiptEmail" className={labelClass}>Receipt Email</label>
              <input
                id="receiptEmail"
                type="email"
                placeholder="you@email.com"
                value={formData.receiptEmail || formData.email || ''}
                onChange={(e) => updateField('receiptEmail', e.target.value)}
                className={inputClass}
                style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
              />
            </>
          )}
        </div>
      </div>

      {/* Shipping — store and hotel only */}
      {(vertical === 'store' || vertical === 'hotel') && (
        <div>
          <h3 className="text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: accentColor }}>
            {vertical === 'hotel' ? 'Guest Details' : 'Shipping'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className={labelClass}>First Name</label>
              <input
                id="firstName"
                type="text"
                placeholder="First name"
                value={formData.firstName || ''}
                onChange={(e) => updateField('firstName', e.target.value)}
                className={inputClass}
                style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
              />
            </div>
            <div>
              <label htmlFor="lastName" className={labelClass}>Last Name</label>
              <input
                id="lastName"
                type="text"
                placeholder="Last name"
                value={formData.lastName || ''}
                onChange={(e) => updateField('lastName', e.target.value)}
                className={inputClass}
                style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
              />
            </div>
          </div>
          {vertical === 'store' && (
            <div className="space-y-3 mt-3">
              <div>
                <label htmlFor="address" className={labelClass}>Address</label>
                <input
                  id="address"
                  type="text"
                  placeholder="Street address"
                  value={formData.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                  className={inputClass}
                  style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="city" className={labelClass}>City</label>
                  <input
                    id="city"
                    type="text"
                    placeholder="City"
                    value={formData.city || ''}
                    onChange={(e) => updateField('city', e.target.value)}
                    className={inputClass}
                    style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label htmlFor="zip" className={labelClass}>ZIP</label>
                  <input
                    id="zip"
                    type="text"
                    placeholder="ZIP"
                    value={formData.zip || ''}
                    onChange={(e) => updateField('zip', e.target.value)}
                    className={inputClass}
                    style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label htmlFor="country" className={labelClass}>Country</label>
                  <input
                    id="country"
                    type="text"
                    placeholder="Country"
                    value={formData.country || ''}
                    onChange={(e) => updateField('country', e.target.value)}
                    className={inputClass}
                    style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Restaurant-specific: table number */}
      {vertical === 'restaurant' && (
        <div>
          <h3 className="text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: accentColor }}>
            Table
          </h3>
          <div>
            <label htmlFor="tableNumber" className={labelClass}>Table Number</label>
            <input
              id="tableNumber"
              type="text"
              placeholder="e.g. 12"
              value={formData.tableNumber || ''}
              onChange={(e) => updateField('tableNumber', e.target.value)}
              className={inputClass}
              style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
            />
          </div>
        </div>
      )}

      {/* Extra fields */}
      {extraFields && extraFields.length > 0 && (
        <div className="space-y-3">
          {extraFields.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className={labelClass}>
                {field.label} {field.required && <span className="text-[var(--error)]">*</span>}
              </label>
              {field.type === 'select' ? (
                <select
                  id={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  className={inputClass}
                  style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  className={`${inputClass} min-h-[80px] resize-y`}
                  style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                />
              ) : field.type === 'checkbox' ? (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData[field.name] === 'true'}
                    onChange={(e) => updateField(field.name, e.target.checked ? 'true' : 'false')}
                    className="w-4 h-4 rounded-sm border-[var(--ash)] accent-current"
                    style={{ accentColor }}
                  />
                  <span className="text-[var(--text-sm)] font-body text-[var(--cloud)]">
                    {field.placeholder || field.label}
                  </span>
                </label>
              ) : (
                <input
                  id={field.name}
                  type={field.type === 'number' ? 'number' : 'text'}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  className={inputClass}
                  style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
