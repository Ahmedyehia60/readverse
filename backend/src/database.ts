import { Pool } from "pg";

let pool: Pool | undefined;
let schemaReady: Promise<void> | undefined;

export function getPool() {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");
  pool = new Pool({
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  return pool;
}

export function ensureSchema() {
  schemaReady ??= getPool().query(`
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
    );
  `).then(() => undefined).catch((error: unknown) => {
    schemaReady = undefined;
    throw error;
  });
  return schemaReady;
}
