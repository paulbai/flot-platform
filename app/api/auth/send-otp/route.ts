import { NextResponse } from "next/server";
import { generateOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

// In-memory rate limiting (per-process, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > MAX_REQUESTS_PER_WINDOW;
}

// Clean up old entries on each request (avoids setInterval in serverless)
function cleanupRateLimits() {
  const now = Date.now();
  const expired: string[] = [];
  rateLimitMap.forEach((entry, key) => {
    if (now > entry.resetAt) expired.push(key);
  });
  expired.forEach((key) => rateLimitMap.delete(key));
}

export async function POST(request: Request) {
  cleanupRateLimits();
  try {
    // Rate limit by IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

    if (isRateLimited(`ip:${ip}`)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Rate limit by email
    if (isRateLimited(`email:${email.toLowerCase().trim()}`)) {
      return NextResponse.json(
        { error: "Too many requests for this email. Please wait a minute." },
        { status: 429 }
      );
    }

    const code = generateOtp(email);
    await sendOtpEmail(email, code);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
