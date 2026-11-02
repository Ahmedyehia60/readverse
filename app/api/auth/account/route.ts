import { NextResponse } from "next/server";
import type { PoolClient } from "pg";
import { clearSessionCookie, getCurrentUser } from "@/lib/auth";
import { ensureLibraryTable, postgres } from "@/lib/postgres";

export async function DELETE() {
  let client: PoolClient | undefined;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to terminate your account." }, { status: 401 });
    }

    await ensureLibraryTable();
    client = await postgres.connect();
    await client.query("BEGIN");
    const result = await client.query(
      "DELETE FROM readverse_users WHERE id = $1 RETURNING id",
      [user.id],
    );
    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Account was not found." }, { status: 404 });
    }
    await client.query("COMMIT");

    const response = NextResponse.json({ ok: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => undefined);
    console.error("Account termination failed:", error);
    return NextResponse.json({ error: "Could not terminate the account." }, { status: 503 });
  } finally {
    client?.release();
  }
}
