import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import User from "@/models/users";

export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookTitle } = await req.json();
    if (!bookTitle) {
      return NextResponse.json({ error: "Missing bookTitle" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.favorites = user.favorites || [];

    if (!user.favorites.includes(bookTitle)) {
      user.favorites.push(bookTitle);
      await user.save();
    }

    return NextResponse.json({ favorites: user.favorites });
  } catch (error) {
    console.error("Favorites POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email }).select(
      "favorites"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      favorites: user.favorites || [],
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookTitle } = await req.json();
    if (!bookTitle) {
      return NextResponse.json({ error: "Missing bookTitle" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    user.favorites = user.favorites.filter((fav) => fav !== bookTitle);
    await user.save();


    return NextResponse.json({ favorites: user.favorites });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
