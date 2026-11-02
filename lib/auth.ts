import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { ensureLibraryTable, postgres } from "@/lib/postgres";

const SESSION_COOKIE = "readverse_session";
const SESSION_DAYS = 30;

export type ReadverseUser = { id: string; name: string; email: string };
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string) {
  await ensureLibraryTable();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await postgres.query(
    "INSERT INTO readverse_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
    [hashToken(token), userId, expiresAt],
  );
  return { token, expiresAt };
}

export async function getCurrentUser(): Promise<ReadverseUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  await ensureLibraryTable();
  const result = await postgres.query<ReadverseUser>(
    `SELECT users.id, users.name, users.email
     FROM readverse_sessions AS sessions
     JOIN readverse_users AS users ON users.id = sessions.user_id
     WHERE sessions.token_hash = $1 AND sessions.expires_at > NOW()`,
    [hashToken(token)],
  );
  return result.rows[0] ?? null;
}

export function setSessionCookie(response: Response, token: string, expiresAt: Date) {
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`,
  );
}

export async function revokeCurrentSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return;
  await ensureLibraryTable();
  await postgres.query("DELETE FROM readverse_sessions WHERE token_hash = $1", [hashToken(token)]);
}

export function clearSessionCookie(response: Response) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}
