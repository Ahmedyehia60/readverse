import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import User from "@/models/users";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
interface BookItem {
  id: string;
  volumeInfo: BookVolumeInfo;
}
interface BookVolumeInfo {
  title: string;
  authors?: string[];
  description?: string;
  categories?: string[];
  imageLinks?: {
    smallThumbnail: string;
    thumbnail: string;
  };
}
interface ScoredBook extends BookItem {
  score: number;
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cat1 = searchParams.get("category1");
    const cat2 = searchParams.get("category2");

    // --- Bridge Logic ---
    if (cat1 && cat2) {
      const query = `subject:"${cat1}" subject:"${cat2}"`;

      const googleRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          query
        )}&maxResults=20`
      );
      const data = await googleRes.json();

      if (!data.items) return NextResponse.json({ books: [] });

      const scoredBooks = data.items.map((book: BookItem) => {
        const info = book.volumeInfo;
        const title = (info.title || "").toLowerCase();
        const cats = (info.categories || []).map((c: string) =>
          c.toLowerCase()
        );
        const desc = (info.description || "").toLowerCase();

        let score = 0;
        const t1 = cat1.toLowerCase();
        const t2 = cat2.toLowerCase();

        if (title.includes(t1) && title.includes(t2)) score += 20;

        if (cats.some((c) => c.includes(t1))) score += 10;
        if (cats.some((c) => c.includes(t2))) score += 10;

        if (title.includes(t1)) score += 5;
        if (title.includes(t2)) score += 5;
        const hasCat1 =
          title.includes(t1) ||
          cats.some((c) => c.includes(t1)) ||
          desc.includes(t1);
        const hasCat2 =
          title.includes(t2) ||
          cats.some((c) => c.includes(t2)) ||
          desc.includes(t2);

        if (!hasCat1 || !hasCat2) score = 0;

        return { ...book, score };
      });

      const bridgeBooks = scoredBooks
        .filter((b: ScoredBook) => b.score > 5)
        .sort((a: ScoredBook, b: ScoredBook) => b.score - a.score);

      return NextResponse.json({ books: bridgeBooks });
    }
    const user = await User.findById(session.user.id);
    return NextResponse.json({ mindMap: user?.mindMap || [] });
  } catch (error) {
    console.error("🚨 API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
