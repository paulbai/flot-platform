import { NextResponse } from 'next/server';
import { generateOtp, isRateLimited, cleanupExpired } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/email';
import { sendOtpSms } from '@/lib/sms';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+[1-9]\d{6,14}$/;

function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]?.trim() || 'unknown';
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

export async function POST(request: Request) {
  try {
    // Best-effort cleanup of expired OTPs / rate-limit buckets.
    await cleanupExpired().catch(() => {});

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

    // Per-IP rate limit — blocks a single attacker from burning credits across
    // many identifiers. Falls back silently if the DB is unavailable.
    const ip = getClientIp(request);
    if (ip !== 'unknown') {
      try {
        if (await isRateLimited(`ip:${ip}`)) {
          return NextResponse.json(
            { error: 'Too many requests. Please wait a moment and try again.' },
            { status: 429 }
          );
        }
      } catch {
        // Rate-limit table unavailable — do not fail-open on the channel fan-out,
        // but also do not block legitimate users due to infra hiccup. Continue.
      }
    }

    // Per-identifier rate limit — blocks someone from repeatedly spamming the
    // same user's phone/email with verification codes.
    try {
      if (await isRateLimited(`${channel}:${identifier}`)) {
        return NextResponse.json(
          { error: 'Too many requests for this address. Please wait a moment.' },
          { status: 429 }
        );
      }
    } catch {
      // see note above
    }

    const code = await generateOtp(identifier);

    if (channel === 'email') {
      await sendOtpEmail(identifier, code);
    } else {
      await sendOtpSms(identifier, code);
    }

    return NextResponse.json({ success: true, channel });
  } catch (err) {
    console.error('[send-otp]', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
