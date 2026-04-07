import { randomInt } from 'crypto';

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

const globalForOtp = globalThis as typeof globalThis & {
  __otpStore?: Map<string, { code: string; expires: number; attempts: number }>;
};

if (!globalForOtp.__otpStore) {
  globalForOtp.__otpStore = new Map();
}

const otpStore = globalForOtp.__otpStore;

export function generateOtp(email: string): string {
  const code = randomInt(100000, 999999).toString();
  otpStore.set(email.toLowerCase().trim(), {
    code,
    expires: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
  });
  return code;
}

export function verifyOtp(email: string, code: string): boolean {
  const key = email.toLowerCase().trim();
  const entry = otpStore.get(key);
  if (!entry) return false;

  // Check expiry
  if (Date.now() > entry.expires) {
    otpStore.delete(key);
    return false;
  }

  // Check brute-force attempts
  entry.attempts++;
  if (entry.attempts > MAX_ATTEMPTS) {
    otpStore.delete(key);
    return false;
  }

  // Timing-safe comparison
  if (entry.code.length !== code.length) return false;
  let mismatch = 0;
  for (let i = 0; i < entry.code.length; i++) {
    mismatch |= entry.code.charCodeAt(i) ^ code.charCodeAt(i);
  }
  if (mismatch !== 0) return false;

  otpStore.delete(key);
  return true;
}
