import { NextResponse } from 'next/server';
import { generateOtp, isRateLimited, cleanupExpired } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/email';
import { sendOtpSms } from '@/lib/sms';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+[1-9]\d{6,14}$/;

export async function POST(request: Request) {
  try {
    await cleanupExpired();

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

    if (await isRateLimited(`ip:${ip}`)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      );
    }

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

    if (await isRateLimited(`${channel}:${identifier}`)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      );
    }

    const code = await generateOtp(identifier);

    if (channel === 'email') {
      await sendOtpEmail(identifier, code);
    } else {
      await sendOtpSms(identifier, code);
    }

    return NextResponse.json({ success: true, channel });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack?.split('\n').slice(0, 4).join('\n') : '';
    console.error('[send-otp]', msg, stack);
    return NextResponse.json(
      { error: 'Failed to send verification code', debug: msg, dbUrl: process.env.TURSO_DATABASE_URL?.slice(0, 40) },
      { status: 500 }
    );
  }
}
