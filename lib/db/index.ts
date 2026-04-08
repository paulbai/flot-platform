import { drizzle } from 'drizzle-orm/libsql/web';
import * as schema from './schema';

/**
 * Lazy-initialised database singleton.
 * Uses drizzle-orm/libsql/web for Vercel serverless compatibility.
 */
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function db() {
  if (!_db) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) {
      throw new Error('Missing required environment variable: TURSO_DATABASE_URL');
    }
    _db = drizzle({
      connection: {
        url: url.replace(/^libsql:\/\//, 'https://'),
        authToken: process.env.TURSO_AUTH_TOKEN,
      },
      schema,
    });
  }
  return _db;
}
