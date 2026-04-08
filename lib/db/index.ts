import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/web';
import * as schema from './schema';

/**
 * Lazy-initialised database singleton.
 * Uses @libsql/client/web for Vercel serverless + drizzle-orm/libsql driver.
 */
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function db() {
  if (!_db) {
    const raw = process.env.TURSO_DATABASE_URL;
    if (!raw) {
      throw new Error('Missing required environment variable: TURSO_DATABASE_URL');
    }
    // Aggressive trim to handle any invisible chars from env vars
    const url = raw.trim().replace(/[\r\n\t\x00-\x1f]/g, '');
    const client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN?.trim(),
    });
    _db = drizzle(client, { schema });
  }
  return _db;
}
