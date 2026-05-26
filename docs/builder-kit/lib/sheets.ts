import type { SiteConfig } from './types/customization';

const SPREADSHEET_ID = '1tHAdfg1SyuFKusQkTFTEkwLIIINtC9I9bUiqZD_XO9U';
const SHEET_NAME = 'Sheet1';

/**
 * Logs the merchant's first publish to a Google Sheet for ops tracking.
 *
 * The `googleapis` package is ~45 MB once node_modules unpack — we don't want
 * it in the cold-start bundle of every API route, especially since most
 * publishes don't need it (re-publishes are no-ops, dev/staging may not have
 * Google creds at all). Import lazily inside the function so Next.js can
 * tree-shake it out of routes that never call this.
 */
export async function logMerchantPublish(config: SiteConfig, ownerIdentifier: string): Promise<void> {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    console.warn('[sheets] Missing Google service account credentials — skipping');
    return;
  }

  try {
    // Lazy-import — keeps googleapis out of cold-start bundles.
    const { google } = await import('googleapis');
    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const contact = (config as unknown as Record<string, unknown>).contact as Record<string, string> | undefined;
    const brand = config.brand;

    const businessName = brand?.businessName || '—';
    const templateId   = config.templateId || '—';
    const siteUrl      = `https://build.flotme.ai/${config.slug}`;
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
