import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyOtp } from "./otp";

// ─── HYBRID MODE ─────────────────────────────────────────────
// SMS: real OTP verification via database
// Email: beta mode — accepts 000000 until Resend domain verified
// ─────────────────────────────────────────────────────────────

const BETA_EMAIL_OTP = '000000';

if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
  throw new Error('AUTH_SECRET or NEXTAUTH_SECRET environment variable is required');
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        phone: { type: "text" },
        code: { type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const phone = credentials?.phone as string | undefined;
        const code = credentials?.code as string;

        if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
          return null;
        }

        // Determine the identifier (email or phone)
        let identifier: string | null = null;
        let isPhone = false;

        if (phone && typeof phone === 'string' && /^\+[1-9]\d{6,14}$/.test(phone)) {
          identifier = phone;
          isPhone = true;
        } else if (email && typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          identifier = email;
        }

        if (!identifier) return null;

        if (isPhone) {
          // Real OTP verification for phone sign-ins
          const isValid = await verifyOtp(identifier, code);
          if (!isValid) return null;
        } else {
          // Email: beta mode — accept hardcoded 000000
          if (code !== BETA_EMAIL_OTP) return null;
        }

        const displayName = isPhone ? identifier : identifier.split("@")[0];

        return {
          id: identifier,
          email: isPhone ? undefined : identifier,
          name: displayName,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.email = user.email || undefined;
        // For phone users, name contains the phone number (starts with +)
        token.name = user.name || undefined;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.email) {
          session.user.email = token.email as string;
        }
        if (token.name) {
          session.user.name = token.name as string;
        }
      }
      return session;
    },
  },
});
