import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyOtp } from "./otp";

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

        if (email && typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          identifier = email;
        } else if (phone && typeof phone === 'string' && /^\+[1-9]\d{6,14}$/.test(phone)) {
          identifier = phone;
        }

        if (!identifier) return null;

        const isValid = await verifyOtp(identifier, code);
        if (!isValid) return null;

        const isPhone = identifier.startsWith('+');
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
