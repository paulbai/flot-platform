/**
 * AppHiveSL SMS integration for OTP delivery.
 * Uses the GET endpoint for simplicity — credentials passed as URL params.
 * Docs: https://apphivesl.com/developers
 */

const BASE_URL = 'https://api.sierrahive.com/v1/messages/sms';

export async function sendOtpSms(phone: string, code: string): Promise<void> {
  const clientId = process.env.APPHIVE_CLIENT_ID;
  const clientSecret = process.env.APPHIVE_CLIENT_SECRET;
  const token = process.env.APPHIVE_TOKEN;

  if (!clientId || !clientSecret || !token) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n========================================`);
      console.log(`  OTP for ${phone}: ${code}`);
      console.log(`========================================\n`);
    } else {
      console.warn('AppHiveSL credentials not configured — OTP SMS not sent');
    }
    return;
  }

  // AppHiveSL expects E.164 without the '+' prefix
  const to = phone.replace(/^\+/, '');

  const params = new URLSearchParams({
    clientId,
    clientSecret,
    token,
    from: 'FlotAi',   // max 11 chars
    to,
    content: `Your Flot verification code is: ${code}. It expires in 10 minutes.`,
  });

  const res = await fetch(`${BASE_URL}?${params.toString()}`);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AppHiveSL SMS failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  console.log('[sms] AppHiveSL response:', data.Status, 'to:', to);
}
