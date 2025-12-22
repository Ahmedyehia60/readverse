import React from "react";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import User from "@/models/users";



export async function POST(res: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookTitle } = await res.json();
    const user = await User.findById(session.user.id);

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (!user.favorites) user.favorites = [];
    if (!user.favorites.includes(bookTitle)) {
      user.favorites.push(bookTitle);
      await user.save();
    }
    return NextResponse.json({
      message: "Book added to favorites",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
