import { NextResponse } from 'next/server';

// ─── BETA MODE ───────────────────────────────────────────────
// OTP is hardcoded to 000000 for beta testing.
// TODO: Re-enable real OTP once domain is verified on Resend.
// ─────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+[1-9]\d{6,14}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone } = body as { email?: string; phone?: string };

    let channel: 'email' | 'sms';

    if (email && typeof email === 'string' && EMAIL_RE.test(email)) {
      channel = 'email';
    } else if (phone && typeof phone === 'string' && PHONE_RE.test(phone)) {
      channel = 'sms';
    } else {
      return NextResponse.json(
        { error: 'A valid email or phone number is required' },
        { status: 400 }
      );
    }

    // Beta: no actual OTP generated or sent — user enters 000000
    return NextResponse.json({ success: true, channel });
  } catch (err) {
    console.error('[send-otp]', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
