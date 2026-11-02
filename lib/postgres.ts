import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to connect to PostgreSQL.");
}

type PostgresGlobals = typeof globalThis & { brainBookPool?: Pool; brainBookSchema?: Promise<void> };
const globalWithPool = globalThis as PostgresGlobals;

export const postgres = globalWithPool.brainBookPool ?? new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

if (process.env.NODE_ENV !== "production") globalWithPool.brainBookPool = postgres;

export function ensureLibraryTable() {
  globalWithPool.brainBookSchema ??= postgres.query(`
    CREATE TABLE IF NOT EXISTS readverse_users (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS readverse_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES readverse_users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS readverse_sessions_expiry_idx ON readverse_sessions (expires_at);
    CREATE TABLE IF NOT EXISTS readverse_library (
      user_id UUID PRIMARY KEY REFERENCES readverse_users(id) ON DELETE CASCADE,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `).then(() => undefined);
  return globalWithPool.brainBookSchema;
}
