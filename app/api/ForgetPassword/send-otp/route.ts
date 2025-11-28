// /app/api/ForgetPassword/send-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import PasswordReset from "@/models/passwordReset";
import User from "@/models/users"; 
import connectDB from "@/lib/mongo"; 
import { transporter } from "@/lib/mail"; 

function generateOTP(length = 6) {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
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

    const otp = generateOTP(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    await PasswordReset.deleteMany({ email });

    await PasswordReset.create({
      email,
      otp,
      expiresAt,
    });

    await transporter.sendMail({
      from: `"ReadVerse" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Password Reset Code",
      html: `
        <h2>Your Verification Code</h2>
        <p>Use this code to reset your password:</p>
        <h1 style="font-size:32px; letter-spacing:4px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
      `,
    });

    return NextResponse.json(
      { success: true, message: "OTP sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in send-otp:", error);
    if (!mongoose.connection.readyState) {
      console.error("MongoDB is not connected");
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
