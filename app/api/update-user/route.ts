import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongo";
import User from "@/models/users";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  await connectToDatabase();

  const formData = await req.formData();

  const userId = formData.get("userId") as string;
  const name = formData.get("name") as string;
  const imageFile = formData.get("image") as File | null;

  if (!userId) {
    return NextResponse.json({ error: "User ID missing" }, { status: 400 });
  }

  const user = await User.findById(userId);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  user.name = name;

  if (imageFile) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${userId}-${Date.now()}.png`;
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);

    await writeFile(filePath, buffer);

    user.image = `/uploads/${fileName}`;
  }

  await user.save();

  return NextResponse.json({ user });
}
