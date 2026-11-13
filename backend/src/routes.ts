import { compare, hash } from "bcryptjs";
import { randomUUID } from "node:crypto";
import { Router } from "express";
import { currentUser, createSession, revokeSession } from "./auth";
import { ensureSchema, getPool } from "./database";

const router = Router();
const emptyLibrary = { books: [], favorites: [], links: [], notes: [], profileName: "Book reader" };

router.get("/health", async (_request, response) => {
  try {
    await getPool().query("SELECT 1");
    response.json({ status: "ok", database: "connected" });
  } catch {
    response.status(503).json({ status: "unavailable", database: "disconnected" });
  }
});

router.post("/auth/signup", async (request, response) => {
  try {
    const name = typeof request.body?.name === "string" ? request.body.name.trim() : "";
    const email = typeof request.body?.email === "string" ? request.body.email.trim().toLowerCase() : "";
    const password = typeof request.body?.password === "string" ? request.body.password : "";
    if (!name || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || password.length < 8 || password.length > 128) {
      response.status(400).json({ error: "Enter a valid name, email, and password (8–128 characters)." });
      return;
    }
    await ensureSchema();
    const id = randomUUID();
    const passwordHash = await hash(password, 12);
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      await client.query("INSERT INTO readverse_users (id, name, email, password_hash) VALUES ($1, $2, $3, $4)", [id, name, email, passwordHash]);
      await client.query("INSERT INTO readverse_library (user_id, data) VALUES ($1, $2::jsonb)", [id, JSON.stringify({ ...emptyLibrary, profileName: name })]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      if ((error as { code?: string }).code === "23505") {
        response.status(409).json({ error: "An account with this email already exists." });
        return;
      }
      throw error;
    } finally {
      client.release();
    }
    await createSession(id, response);
    response.status(201).json({ user: { id, name, email } });
  } catch (error) {
    console.error("Signup failed:", error);
    response.status(503).json({ error: "Could not create your account." });
  }
});

router.post("/auth/login", async (request, response) => {
  try {
    const email = typeof request.body?.email === "string" ? request.body.email.trim().toLowerCase() : "";
    const password = typeof request.body?.password === "string" ? request.body.password : "";
    if (!email || !password || email.length > 254 || password.length > 128) {
      response.status(400).json({ error: "Email and password are required." });
      return;
    }
    await ensureSchema();
    const result = await getPool().query<{ id: string; name: string; email: string; password_hash: string }>(
      "SELECT id, name, email, password_hash FROM readverse_users WHERE email = $1", [email],
    );
    const account = result.rows[0];
    if (!account || !(await compare(password, account.password_hash))) {
      response.status(401).json({ error: "Email or password is incorrect." });
      return;
    }
    await createSession(account.id, response);
    response.json({ user: { id: account.id, name: account.name, email: account.email } });
  } catch (error) {
    console.error("Login failed:", error);
    response.status(503).json({ error: "Could not sign in right now." });
  }
});

router.get("/auth/session", async (request, response) => {
  try {
    response.set("Cache-Control", "no-store").json({ user: await currentUser(request) });
  } catch {
    response.status(503).json({ error: "Could not check your session." });
  }
});

router.post("/auth/logout", async (request, response) => {
  try {
    await revokeSession(request, response);
    response.json({ ok: true });
  } catch {
    response.status(503).json({ error: "Could not sign out." });
  }
});

router.delete("/auth/account", async (request, response) => {
  try {
    const user = await currentUser(request);
    if (!user) {
      response.status(401).json({ error: "Sign in to terminate your account." });
      return;
    }
    await ensureSchema();
    await getPool().query("DELETE FROM readverse_users WHERE id = $1", [user.id]);
    await revokeSession(request, response);
    response.json({ ok: true });
  } catch (error) {
    console.error("Account deletion failed:", error);
    response.status(503).json({ error: "Could not terminate the account." });
  }
});

router.get("/library", async (request, response) => {
  try {
    const user = await currentUser(request);
    if (!user) {
      response.status(401).json({ error: "Sign in to access your library." });
      return;
    }
    await ensureSchema();
    const result = await getPool().query<{ data: typeof emptyLibrary; updated_at: Date }>(
      "SELECT data, updated_at FROM readverse_library WHERE user_id = $1", [user.id],
    );
    if (result.rowCount) {
      response.set("Cache-Control", "no-store").json(result.rows[0]);
      return;
    }
    const inserted = await getPool().query<{ data: typeof emptyLibrary; updated_at: Date }>(
      "INSERT INTO readverse_library (user_id, data) VALUES ($1, $2::jsonb) RETURNING data, updated_at",
      [user.id, JSON.stringify({ ...emptyLibrary, profileName: user.name })],
    );
    response.set("Cache-Control", "no-store").json(inserted.rows[0]);
  } catch (error) {
    console.error("Library read failed:", error);
    response.status(503).json({ error: "Library storage is unavailable." });
  }
});

router.put("/library", async (request, response) => {
  try {
    const user = await currentUser(request);
    if (!user) {
      response.status(401).json({ error: "Sign in to access your library." });
      return;
    }
    const data = request.body?.data;
    if (!data || !["books", "favorites", "links", "notes"].every((key) => Array.isArray(data[key]))) {
      response.status(400).json({ error: "Invalid library data." });
      return;
    }
    const serialized = JSON.stringify({ ...emptyLibrary, ...data });
    if (serialized.length > 2_000_000) {
      response.status(413).json({ error: "Library is too large to save." });
      return;
    }
    await ensureSchema();
    const result = await getPool().query<{ data: typeof emptyLibrary; updated_at: Date }>(
      `INSERT INTO readverse_library (user_id, data) VALUES ($1, $2::jsonb)
       ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
       RETURNING data, updated_at`,
      [user.id, serialized],
    );
    response.set("Cache-Control", "no-store").json(result.rows[0]);
  } catch (error) {
    console.error("Library write failed:", error);
    response.status(503).json({ error: "Library storage is unavailable." });
  }
});

export default router;
