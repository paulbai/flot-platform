import { randomInt } from 'crypto';
import { db } from './db';
import { otpCodes, rateLimits } from './db/schema';
import { eq, and, gt, lt } from 'drizzle-orm';

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

export async function generateOtp(email: string): Promise<string> {
  const key = email.toLowerCase().trim();
  const code = randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  // Delete any existing OTP for this email
  await db.delete(otpCodes).where(eq(otpCodes.email, key));

  // Insert new OTP
  await db.insert(otpCodes).values({
    email: key,
    code,
    attempts: 0,
    expiresAt,
  });

  return code;
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const key = email.toLowerCase().trim();
  const now = new Date();

  // Find the OTP entry
  const entries = await db.select().from(otpCodes)
    .where(and(eq(otpCodes.email, key), gt(otpCodes.expiresAt, now)));

  if (entries.length === 0) return false;

  const entry = entries[0];

  // Check brute-force attempts
  if (entry.attempts >= MAX_ATTEMPTS) {
    await db.delete(otpCodes).where(eq(otpCodes.id, entry.id));
    return false;
  }

  // Increment attempts
  await db.update(otpCodes)
    .set({ attempts: entry.attempts + 1 })
    .where(eq(otpCodes.id, entry.id));

  // Timing-safe comparison
  if (entry.code.length !== code.length) return false;
  let mismatch = 0;
  for (let i = 0; i < entry.code.length; i++) {
    mismatch |= entry.code.charCodeAt(i) ^ code.charCodeAt(i);
  }
  if (mismatch !== 0) return false;

  // Success — delete the OTP
  await db.delete(otpCodes).where(eq(otpCodes.id, entry.id));
  return true;
}

export async function isRateLimited(key: string): Promise<boolean> {
  const now = new Date();

  // Clean up expired entries
  await db.delete(rateLimits).where(lt(rateLimits.resetAt, now));

  // Check current rate
  const entries = await db.select().from(rateLimits)
    .where(and(eq(rateLimits.key, key), gt(rateLimits.resetAt, now)));

  if (entries.length === 0) {
    await db.insert(rateLimits).values({
      key,
      count: 1,
      resetAt: new Date(Date.now() + RATE_LIMIT_WINDOW_MS),
    });
    return false;
  }

  const entry = entries[0];
  await db.update(rateLimits)
    .set({ count: entry.count + 1 })
    .where(eq(rateLimits.id, entry.id));

  return entry.count >= MAX_REQUESTS_PER_WINDOW;
}

// Cleanup expired entries (call periodically or on each request)
export async function cleanupExpired(): Promise<void> {
  const now = new Date();
  await db.delete(otpCodes).where(lt(otpCodes.expiresAt, now));
  await db.delete(rateLimits).where(lt(rateLimits.resetAt, now));
}
