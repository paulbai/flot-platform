import { NextResponse } from 'next/server';
import { generateOtp } from '@/lib/otp';
import { sendOtpSms } from '@/lib/sms';

// ─── HYBRID MODE ─────────────────────────────────────────────
// SMS: real OTP via AppHiveSL
// Email: beta mode (000000) until Resend domain is verified
// ─────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+[1-9]\d{6,14}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone } = body as { email?: string; phone?: string };

    let identifier: string;
    let channel: 'email' | 'sms';

    if (email && typeof email === 'string' && EMAIL_RE.test(email)) {
      identifier = email.toLowerCase().trim();
      channel = 'email';
    } else if (phone && typeof phone === 'string' && PHONE_RE.test(phone)) {
      identifier = phone.trim();
      channel = 'sms';
    } else {
      return NextResponse.json(
        { error: 'A valid email or phone number is required' },
        { status: 400 }
      );
    }

    if (channel === 'sms') {
      // Real OTP flow for SMS via AppHiveSL
      const code = await generateOtp(identifier);
      await sendOtpSms(identifier, code);
    }
    // Email: no OTP generated — user enters 000000 (beta)

    return NextResponse.json({ success: true, channel });
  } catch (err) {
    console.error('[send-otp]', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
