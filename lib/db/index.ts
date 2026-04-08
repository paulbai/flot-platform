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
    if (!process.env.TURSO_DATABASE_URL) {
      throw new Error('Missing required environment variable: TURSO_DATABASE_URL');
    }
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    _db = drizzle(client, { schema });
  }
  return _db;
}
