import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth";
import { ensureLibraryTable, postgres } from "@/lib/postgres";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json() as { email?: string; password?: string };
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    await ensureLibraryTable();
    const result = await postgres.query<{ id: string; name: string; email: string; password_hash: string }>(
      "SELECT id, name, email, password_hash FROM readverse_users WHERE email = $1",
      [cleanEmail],
    );
    const account = result.rows[0];
    if (!account || !(await compare(password, account.password_hash))) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }
    const session = await createSession(account.id);
    const response = NextResponse.json({ user: { id: account.id, name: account.name, email: account.email } });
    setSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    console.error("Readverse login failed:", error);
    return NextResponse.json({ error: "Could not sign in right now." }, { status: 503 });
  }
}
