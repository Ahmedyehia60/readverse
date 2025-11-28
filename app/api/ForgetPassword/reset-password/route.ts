// /app/api/ForgetPassword/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import PasswordReset from "@/models/passwordReset";
import User from "@/models/users";
import connectDB from "@/lib/mongo";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Email, OTP and newPassword are required" },
        { status: 400 }
      );
    }


    const record = await PasswordReset.findOne({ email, otp });

    if (!record) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: "OTP has expired" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }


    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await PasswordReset.deleteMany({ email });

    return NextResponse.json(
      { success: true, message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in reset-password:", error);
    if (!mongoose.connection.readyState) {
      console.error("MongoDB is not connected");
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
