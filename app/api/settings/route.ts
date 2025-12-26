import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/users";
import connectDB from "@/lib/mongo";
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, currentPassword, newPassword } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This account is managed by a third-party provider (Google/Facebook).",
        },
        { status: 403 }
      );
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password!);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Current password incorrect" },
        { status: 401 }
      );
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return NextResponse.json({ success: true, message: "Password updated" });
  } catch {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
