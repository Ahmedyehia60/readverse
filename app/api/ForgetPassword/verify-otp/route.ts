// /app/api/ForgetPassword/verify-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import PasswordReset from "@/models/passwordReset";
import connectDB from "@/lib/mongo";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
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

    
    return NextResponse.json(
      { success: true, message: "OTP verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in verify-otp:", error);
    if (!mongoose.connection.readyState) {
      console.error("MongoDB is not connected");
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
