import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL ?? 'Flot <onboarding@resend.dev>';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  if (!resend) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n========================================`);
      console.log(`  OTP for ${email}: ${code}`);
      console.log(`========================================\n`);
    } else {
      console.warn('RESEND_API_KEY not configured — OTP email not sent');
    }
    return;
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: 'Your Flot verification code',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #111; font-size: 20px; margin-bottom: 8px;">Your verification code</h2>
        <p style="color: #666; font-size: 14px; margin-bottom: 24px;">Enter this code to sign in to Flot:</p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #111;">${code}</span>
        </div>
        <p style="color: #999; font-size: 12px;">This code expires in 10 minutes. If you didn&apos;t request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

interface OrderConfirmationPayload {
  to: string;
  reference: string;
  brandName: string;
  customerName: string;
  total: number;
  currency: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  vertical: 'hotel' | 'restaurant' | 'store' | 'travel';
  status: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled';
}

/**
 * Best-effort order confirmation email to the buyer. Silently no-ops if:
 *   - Resend isn't configured (dev / staging without keys)
 *   - The buyer didn't provide an email (restaurant takeaway/dine-in,
 *     store delivery without email — empty string)
 *   - The send itself throws — we log and swallow so a flaky email
 *     provider can't break the order POST.
 */
export async function sendOrderConfirmationEmail(payload: OrderConfirmationPayload): Promise<void> {
  if (!payload.to || !payload.to.trim()) return;
  if (!resend) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[email] (skipped — no RESEND_API_KEY) order confirmation for ${payload.to} ref=${payload.reference}`);
    }
    return;
  }

  const subject =
    payload.status === 'pending'
      ? `Reservation pending — ${payload.reference}`
      : `Order confirmed — ${payload.reference}`;

  const heading =
    payload.status === 'pending'
      ? `Your reservation is being held`
      : `Thanks for your order`;

  const subheading =
    payload.status === 'pending'
      ? `${escapeHtml(payload.brandName)} has reserved this for you. Pay any time from "My Reservations" on the site.`
      : `${escapeHtml(payload.brandName)} received your order.`;

  const itemRows = payload.items
    .map((it) => `
      <tr>
        <td style="padding: 8px 0; color: #333; font-size: 14px;">${escapeHtml(it.name)} ${it.quantity > 1 ? `× ${it.quantity}` : ''}</td>
        <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right; white-space: nowrap;">${escapeHtml(payload.currency)}${(it.unitPrice * it.quantity).toLocaleString()}</td>
      </tr>
    `)
    .join('');

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: payload.to,
      subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; color: #111;">
          <p style="font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: #888; margin: 0 0 8px 0;">${escapeHtml(payload.brandName)}</p>
          <h1 style="font-size: 22px; margin: 0 0 8px 0;">${heading}</h1>
          <p style="color: #555; font-size: 14px; margin: 0 0 24px 0;">${subheading}</p>

          <div style="background: #f7f7f5; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 6px 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">Reference</p>
            <p style="margin: 0; font-family: 'SFMono-Regular', Menlo, monospace; font-size: 18px; font-weight: 700; letter-spacing: 1px;">${escapeHtml(payload.reference)}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; border-bottom: 1px solid #eee;">
            ${itemRows}
          </table>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 12px 0 0 0; font-weight: 700; font-size: 15px;">Total</td>
              <td style="padding: 12px 0 0 0; font-weight: 700; font-size: 15px; text-align: right;">${escapeHtml(payload.currency)}${payload.total.toLocaleString()}</td>
            </tr>
          </table>

          <p style="color: #888; font-size: 12px; margin: 32px 0 0 0;">
            Save your reference. If you need to follow up, mention it to ${escapeHtml(payload.brandName)}.
          </p>
        </div>
      `,
    });
  } catch (err) {
    // Don't break the order — just log. The order is already in the DB.
    console.error('[email] order confirmation failed', err instanceof Error ? err.message : err);
  }
}
