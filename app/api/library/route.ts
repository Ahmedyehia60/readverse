import { NextRequest, NextResponse } from "next/server";
import { ensureLibraryTable, postgres } from "@/lib/postgres";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type LibraryData = {
  books: unknown[];
  favorites: unknown[];
  links: unknown[];
  notes: unknown[];
  profileName: string;
};

const emptyLibrary: LibraryData = {
  books: [],
  favorites: [],
  links: [],
  notes: [],
  profileName: "Book reader",
};

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in to access your library." }, { status: 401 });
    await ensureLibraryTable();
    const result = await postgres.query<{ data: LibraryData; updated_at: Date }>(
      "SELECT data, updated_at FROM readverse_library WHERE user_id = $1",
      [user.id],
    );

    if (result.rowCount === 0) {
      const inserted = await postgres.query<{ data: LibraryData; updated_at: Date }>(
        "INSERT INTO readverse_library (user_id, data) VALUES ($1, $2::jsonb) RETURNING data, updated_at",
        [user.id, JSON.stringify({ ...emptyLibrary, profileName: user.name })],
      );
      return NextResponse.json(inserted.rows[0], { headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.json(result.rows[0], { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("PostgreSQL library read failed:", error);
    return NextResponse.json({ error: "Library storage is unavailable." }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in to access your library." }, { status: 401 });
    const payload = await request.json() as { data?: Partial<LibraryData> };
    const data = payload.data;
    if (!data || !Array.isArray(data.books) || !Array.isArray(data.favorites) || !Array.isArray(data.links) || !Array.isArray(data.notes)) {
      return NextResponse.json({ error: "Invalid library data." }, { status: 400 });
    }
    const serialized = JSON.stringify({ ...emptyLibrary, ...data });
    if (serialized.length > 2_000_000) {
      return NextResponse.json({ error: "Library is too large to save." }, { status: 413 });
    }

    await ensureLibraryTable();
    const result = await postgres.query<{ data: LibraryData; updated_at: Date }>(
      `INSERT INTO readverse_library (user_id, data)
       VALUES ($1, $2::jsonb)
       ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
       RETURNING data, updated_at`,
      [user.id, serialized],
    );
    return NextResponse.json(result.rows[0], { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("PostgreSQL library write failed:", error);
    return NextResponse.json({ error: "Library storage is unavailable." }, { status: 503 });
  }
}
