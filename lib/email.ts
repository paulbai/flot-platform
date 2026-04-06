import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  if (!resend) {
    // Fallback: log to console when no API key is configured
    console.log(`\n========================================`);
    console.log(`  OTP for ${email}: ${code}`);
    console.log(`========================================\n`);
    return;
  }

  const fromAddress = process.env.RESEND_FROM_EMAIL ?? 'Flot <onboarding@resend.dev>';

  await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: 'Your Flot verification code',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #111; font-size: 20px; margin-bottom: 8px;">Your verification code</h2>
        <p style="color: #666; font-size: 14px; margin-bottom: 24px;">Enter this code to sign in to Flot:</p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #111;">${code}</span>
        </div>
        <p style="color: #999; font-size: 12px;">This code expires in 5 minutes. If you didn&apos;t request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
