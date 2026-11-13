import dotenv from "dotenv";
import { ensureSchema, getPool } from "../database";

dotenv.config({ path: ".env.local" });

ensureSchema()
  .then(async () => {
    console.log("Readverse database schema is ready.");
    await getPool().end();
  })
  .catch(async (error: unknown) => {
    console.error("PostgreSQL setup failed:", error instanceof Error ? error.message : error);
    if (process.exitCode !== 0) process.exitCode = 1;
    if (process.env.DATABASE_URL) await getPool().end().catch(() => undefined);
  });
