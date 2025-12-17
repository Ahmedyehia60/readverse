import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import User, { IUser } from "@/models/users";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
interface BookItem {
  id: string;
  volumeInfo: BookVolumeInfo;
}
interface BookVolumeInfo {
  title: string;
  authors?: string[];
  categories?: string[];
  imageLinks?: {
    smallThumbnail: string;
    thumbnail: string;
  };
}
export async function GET(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const category1 = url.searchParams.get("category1");
    const category2 = url.searchParams.get("category2");

    if (category1 && category2) {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=subject:${category1}&maxResults=40`
      );
      const data = await res.json();

      const filteredBooks = data.items.filter((book: BookItem) => {
        const categories = book.volumeInfo.categories || [];
        return categories.includes(category1) && categories.includes(category2);
      });

      return NextResponse.json({ books: filteredBooks });
    }
    const user = (await User.findById(session.user.id)) as IUser | null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ mindMap: user.mindMap });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
