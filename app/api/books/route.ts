import { connectToDatabase } from "@/lib/mongo";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const client = await connectToDatabase();
    const db = client.db("mind_map");

    const books = await db.collection("books").find({}).toArray();
    return NextResponse.json(books);
  } catch (error) {
    console.error("Failed to fetch books:", error);
    return NextResponse.json(
      { error: "Failed to connect to database" },
      { status: 500 }
    );
  }
}
