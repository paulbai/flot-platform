import { drizzle } from 'drizzle-orm/libsql/web';
import { createClient } from '@libsql/client/web';
import * as schema from './schema';

/**
 * Lazy-initialised database singleton.
 * Uses @libsql/client/web + drizzle-orm/libsql/web for Vercel serverless.
 */
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function db() {
  if (!_db) {
    const raw = process.env.TURSO_DATABASE_URL;
    if (!raw) {
      throw new Error('Missing required environment variable: TURSO_DATABASE_URL');
    }
    const url = raw.replace(/^libsql:\/\//, 'https://');
    console.log('[db] raw:', raw.slice(0, 20), '→ url:', url.slice(0, 20));
    try {
      const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
      console.log('[db] createClient OK');
      _db = drizzle(client, { schema });
      console.log('[db] drizzle OK');
    } catch (e) {
      console.error('[db] init error:', e instanceof Error ? e.message : e);
      throw e;
    }
  }
  return _db;
}
