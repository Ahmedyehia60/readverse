import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import User from "@/models/users";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
export async function POST(req: Request) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, categories } = await req.json();

  const updatedUser = await User.findByIdAndUpdate(
    session.user.id,
    {
      $push: {
        mindMap: {
          title,
          categories,
        },
      },
    },
    { new: true }
  );

  return NextResponse.json(updatedUser);
}
