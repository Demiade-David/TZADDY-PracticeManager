import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import { requirePermission } from "@/lib/authorization";
import User from "@/models/User";

export async function GET() {
  try {
    await requirePermission("staffManagement");

    await connectDB();

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET users error:", error);

    if (
      error.message === "Unauthorized" ||
      error.message === "Forbidden"
    ) {
      return NextResponse.json(
        { error: error.message },
        {
          status:
            error.message === "Unauthorized"
              ? 401
              : 403,
        }
      );
    }

    return NextResponse.json(
      { error: "Unable to load staff" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await requirePermission("staffManagement");

    await connectDB();

    const body = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const role = body.role || "staff";

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error:
            "Name, email and password are required",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    if (!["admin", "manager", "staff"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "A user with this email already exists",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      active: true,
    });

    return NextResponse.json(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST user error:", error);

    if (
      error.message === "Unauthorized" ||
      error.message === "Forbidden"
    ) {
      return NextResponse.json(
        { error: error.message },
        {
          status:
            error.message === "Unauthorized"
              ? 401
              : 403,
        }
      );
    }

    return NextResponse.json(
      { error: "Unable to create staff account" },
      { status: 500 }
    );
  }
}