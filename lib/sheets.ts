import { google } from 'googleapis';
import type { SiteConfig } from './types/customization';

const SPREADSHEET_ID = '1tHAdfg1SyuFKusQkTFTEkwLIIINtC9I9bUiqZD_XO9U';
const SHEET_NAME = 'Sheet1';

function getAuth() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    console.warn('[sheets] Missing Google service account credentials — skipping');
    return null;
  }

  return new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function logMerchantPublish(config: SiteConfig, ownerIdentifier: string): Promise<void> {
  try {
    const auth = getAuth();
    if (!auth) return;

    const sheets = google.sheets({ version: 'v4', auth });

    const contact = (config as unknown as Record<string, unknown>).contact as Record<string, string> | undefined;
    const brand = config.brand;

    const businessName = brand?.businessName || '—';
    const templateId   = config.templateId || '—';
    const siteUrl      = `https://flot-platform.vercel.app/site/${config.slug}`;
    const ownerEmail   = ownerIdentifier.includes('@') ? ownerIdentifier : '—';
    const ownerPhone   = ownerIdentifier.startsWith('+') ? ownerIdentifier : (contact?.phone || '—');
    const contactEmail = contact?.email || ownerEmail;
    const address      = contact?.address || '—';
    const publishedAt  = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Freetown' });

    const row = [
      businessName,   // A: Business Name
      contactEmail,   // B: Email
      ownerPhone,     // C: Phone
      address,        // D: Address
      templateId,     // E: Template
      siteUrl,        // F: Site URL
      publishedAt,    // G: Published
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:G`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    console.log('[sheets] Logged merchant publish:', businessName, siteUrl);
  } catch (err) {
    // Never block publish — log silently
    console.error('[sheets] Failed to log merchant:', err instanceof Error ? err.message : err);
  }
}
