import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

/**
 * Lazy-initialised database singleton.
 * Deferred so that `next build` doesn't crash when TURSO_DATABASE_URL
 * is absent from the build environment (standard on Vercel).
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

/**
 * Proxy-backed `db` export so consumers can write `db.select()…` directly.
 * The real Drizzle instance is created on first property access, not at import time.
 */
type DbType = ReturnType<typeof getDb>;

export const db: DbType = new Proxy({} as DbType, {
  get(_target, prop) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, instance);
    // Bind methods to the real instance so `this` context is correct
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});
