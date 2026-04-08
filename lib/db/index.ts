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
    const client = createClient({
      url: raw,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    _db = drizzle(client, { schema });
  }
  return _db;
}
