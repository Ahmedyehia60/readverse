import { authOptions } from "./../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongo";
import User from "@/models/users";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await User.findById(session.user.id).select("name image");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
