import { NextResponse } from 'next/server';
import { generateOtp, isRateLimited, cleanupExpired } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    await cleanupExpired();

    // Rate limit by IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

    if (await isRateLimited(`ip:${ip}`)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Rate limit by email
    if (await isRateLimited(`email:${email.toLowerCase().trim()}`)) {
      return NextResponse.json(
        { error: 'Too many requests for this email. Please wait a minute.' },
        { status: 429 }
      );
    }

    const code = await generateOtp(email);
    await sendOtpEmail(email, code);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
