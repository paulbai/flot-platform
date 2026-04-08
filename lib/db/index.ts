import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/web';
import * as schema from './schema';

/**
 * Lazy-initialised database singleton.
 * Uses @libsql/client/web for Vercel serverless compatibility.
 */
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function db() {
  if (!_db) {
    const raw = process.env.TURSO_DATABASE_URL;
    if (!raw) {
      throw new Error('Missing required environment variable: TURSO_DATABASE_URL');
    }
    // @libsql/client/web requires https:// — convert libsql:// if present
    const url = raw.replace(/^libsql:\/\//, 'https://').trim();
    console.log('[db] connecting to:', url.slice(0, 30) + '…');
    const client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    _db = drizzle(client, { schema });
  }
  return _db;
}
