import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return NextResponse.json({
        found: false,
      });
    }

    const matches = await bcrypt.compare(password, user.password);

    return NextResponse.json({
      found: true,
      passwordMatches: matches,
      hashExists: !!user.password,
      hashLength: user.password?.length || 0,
    });
  } catch (error) {
    console.error("Password test error:", error);

    return NextResponse.json(
      { error: "Password test failed" },
      { status: 500 }
    );
  }
}