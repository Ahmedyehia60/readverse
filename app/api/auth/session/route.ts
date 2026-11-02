import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Readverse session lookup failed:", error);
    return NextResponse.json({ error: "Could not check your session." }, { status: 503 });
  }
}
