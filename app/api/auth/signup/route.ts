import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createSession, setSessionCookie } from "@/lib/auth";
import { ensureLibraryTable, postgres } from "@/lib/postgres";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json() as { name?: string; email?: string; password?: string };
    const cleanName = name?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanName || !cleanEmail || !password || password.length < 8 || cleanName.length > 80 || cleanEmail.length > 254) {
      return NextResponse.json({ error: "Enter a name, valid email, and password of at least 8 characters." }, { status: 400 });
    }

    await ensureLibraryTable();
    const userId = randomUUID();
    const passwordHash = await hash(password, 12);
    const client = await postgres.connect();
    try {
      await client.query("BEGIN");
      await client.query("INSERT INTO readverse_users (id, name, email, password_hash) VALUES ($1, $2, $3, $4)", [userId, cleanName, cleanEmail, passwordHash]);
      await client.query("INSERT INTO readverse_library (user_id, data) VALUES ($1, $2::jsonb)", [userId, JSON.stringify({ books: [], favorites: [], links: [], notes: [], profileName: cleanName })]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      if ((error as { code?: string }).code === "23505") return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      throw error;
    } finally {
      client.release();
    }

    const session = await createSession(userId);
    const response = NextResponse.json({ user: { id: userId, name: cleanName, email: cleanEmail } }, { status: 201 });
    setSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    console.error("Readverse signup failed:", error);
    return NextResponse.json({ error: "Could not create your account." }, { status: 503 });
  }
}
