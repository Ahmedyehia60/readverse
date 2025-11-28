import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongo";
import User from "@/models/users";

export async function POST(req: Request) {
  try {
    const { userId, image, interests } = await req.json();

    await connectToDatabase();
    await User.findByIdAndUpdate(userId, { image, interests }, { new: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
