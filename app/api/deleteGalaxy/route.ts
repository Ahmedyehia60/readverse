// app/api/delete-galaxy/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import User from "@/models/users";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // تحديث بيانات المستخدم لتصفير كل المصفوفات
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          mindMap: [],     // مسح كل الكتب والكاتيجوريز
          bridges: [],     // مسح كل الخطوط الواصلة بين الكواكب
          favorites: [],   // مسح قائمة المفضلات
          interests: [],  
        }
      },
      { new: true } // إرجاع البيانات الجديدة بعد التعديل
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Galaxy collapsed successfully",
      success: true 
    });

  } catch (error) {
    console.error("Delete Galaxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}