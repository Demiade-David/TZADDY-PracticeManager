import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  try {
    await connectDB();

    const { email } = await request.json();

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("name email role active");

    if (!user) {
      return NextResponse.json({
        found: false,
        message: "No user found with that email",
      });
    }

    return NextResponse.json({
      found: true,
      user,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }
}