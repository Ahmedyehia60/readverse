const { Client } = require("pg");
const fs = require("node:fs");

const envLine = fs.readFileSync(".env.local", "utf8").split(/\r?\n/).find((line) => line.startsWith("DATABASE_URL="));
if (envLine) process.env.DATABASE_URL = envLine.slice("DATABASE_URL=".length).trim().replace(/^['"]|['"]$/g, "");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is missing from .env.local");

  const databaseUrl = new URL(connectionString);
  const databaseName = decodeURIComponent(databaseUrl.pathname.slice(1));
  const adminUrl = new URL(connectionString);
  adminUrl.pathname = "/postgres";

  const admin = new Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  const found = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [databaseName]);
  if (found.rowCount === 0) {
    const safeName = databaseName.replaceAll('"', '""');
    await admin.query(`CREATE DATABASE "${safeName}"`);
    console.log(`Created PostgreSQL database: ${databaseName}`);
  } else {
    console.log(`Using PostgreSQL database: ${databaseName}`);
  }
  await admin.end();

  const database = new Client({ connectionString });
  await database.connect();
  await database.query(`
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
  `);
  await database.end();
  console.log("Brain Book storage is ready.");
}

main().catch((error) => {
  console.error(`PostgreSQL setup failed: ${error.message}`);
  process.exitCode = 1;
});
