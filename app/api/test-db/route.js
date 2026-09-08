import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      message: "MongoDB connection is working",
    });
  } catch (error) {
    console.error("Database test error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "MongoDB connection failed",
      },
      { status: 500 }
    );
  }
}