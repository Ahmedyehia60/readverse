import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const key = process.env.API_KEY;
  const baseUrl = "https://www.googleapis.com/books/v1/volumes";
  try {
    const response = await fetch(`${baseUrl}?q=${query}&key=${key}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch books:", error);
    return NextResponse.json(
      { error: "Failed to connect to database" },
      { status: 500 }
    );
  }
}
