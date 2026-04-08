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
    const client = createClient({
      url: raw.replace(/^libsql:\/\//, 'https://'),
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    _db = drizzle(client, { schema });
  }
  return _db;
}
