import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/web';
import * as schema from './schema';

/**
 * Lazy-initialised database singleton.
 * Uses @libsql/client/web for Vercel serverless compatibility.
 */
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
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

// Re-export as `db` for convenience
export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop) {
    const instance = getDb();
    const val = (instance as Record<string | symbol, unknown>)[prop];
    if (typeof val === 'function') {
      return (val as Function).bind(instance);
    }
    return val;
  },
});
