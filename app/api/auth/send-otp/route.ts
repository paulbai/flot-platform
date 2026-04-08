import { NextResponse } from 'next/server';
import { generateOtp, isRateLimited, cleanupExpired } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/email';
import { sendOtpSms } from '@/lib/sms';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+[1-9]\d{6,14}$/;

export async function POST(request: Request) {
  try {
    console.log('[send-otp] Step 1: cleanupExpired');
    await cleanupExpired();

    console.log('[send-otp] Step 2: rate limit IP');
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

    if (await isRateLimited(`ip:${ip}`)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      );
    }

    console.log('[send-otp] Step 3: parse body');
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

    console.log('[send-otp] Step 4: rate limit identifier', channel);
    if (await isRateLimited(`${channel}:${identifier}`)) {
      return NextResponse.json(
        { error: `Too many requests. Please wait a minute.` },
        { status: 429 }
      );
    }

    console.log('[send-otp] Step 5: generateOtp');
    const code = await generateOtp(identifier);

    console.log('[send-otp] Step 6: send via', channel);
    if (channel === 'email') {
      await sendOtpEmail(identifier, code);
    } else {
      await sendOtpSms(identifier, code);
    }

    console.log('[send-otp] Step 7: success');
    return NextResponse.json({ success: true, channel });
  } catch (err) {
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error('[send-otp] FAILED:', msg);
    if (err instanceof Error && err.stack) {
      console.error('[send-otp] Stack:', err.stack.split('\n').slice(0, 5).join(' | '));
    }
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
