import { createHash, randomBytes } from "node:crypto";
import type { Request, Response } from "express";
import { ensureSchema, getPool } from "./database";

const COOKIE_NAME = "readverse_session";
const SESSION_DAYS = 30;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

function sessionToken(request: Request) {
  const cookie = request.headers.cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`));
  return cookie ? decodeURIComponent(cookie.slice(COOKIE_NAME.length + 1)) : null;
}

export async function currentUser(request: Request) {
  const token = sessionToken(request);
  if (!token) return null;
  await ensureSchema();
  const result = await getPool().query<{ id: string; name: string; email: string }>(
    `SELECT users.id, users.name, users.email
     FROM readverse_sessions sessions
     JOIN readverse_users users ON users.id = sessions.user_id
     WHERE sessions.token_hash = $1 AND sessions.expires_at > NOW()`,
    [hashToken(token)],
  );
  return result.rows[0] ?? null;
}

export async function createSession(userId: string, response: Response) {
  await ensureSchema();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await getPool().query("DELETE FROM readverse_sessions WHERE expires_at < NOW()");
  await getPool().query(
    "INSERT INTO readverse_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
    [hashToken(token), userId, expiresAt],
  );
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.append("Set-Cookie", `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure}`);
}

export async function revokeSession(request: Request, response: Response) {
  const token = sessionToken(request);
  if (token) {
    await ensureSchema();
    await getPool().query("DELETE FROM readverse_sessions WHERE token_hash = $1", [hashToken(token)]);
  }
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.append("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}
