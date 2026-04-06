const globalForOtp = globalThis as typeof globalThis & {
  __otpStore?: Map<string, { code: string; expires: number }>;
};

if (!globalForOtp.__otpStore) {
  globalForOtp.__otpStore = new Map();
}

const otpStore = globalForOtp.__otpStore;

export function generateOtp(email: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email.toLowerCase(), {
    code,
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
  return code;
}

export function verifyOtp(email: string, code: string): boolean {
  const entry = otpStore.get(email.toLowerCase());
  if (!entry) return false;
  if (Date.now() > entry.expires) {
    otpStore.delete(email.toLowerCase());
    return false;
  }
  if (entry.code !== code) return false;
  otpStore.delete(email.toLowerCase());
  return true;
}
