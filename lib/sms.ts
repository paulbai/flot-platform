import twilio from 'twilio';

const client =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

export async function sendOtpSms(phone: string, code: string): Promise<void> {
  if (!client || !process.env.TWILIO_PHONE_NUMBER) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n========================================`);
      console.log(`  OTP for ${phone}: ${code}`);
      console.log(`========================================\n`);
    } else {
      console.warn('Twilio credentials not configured — OTP SMS not sent');
    }
    return;
  }

  await client.messages.create({
    body: `Your Flot verification code is: ${code}. It expires in 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
}
