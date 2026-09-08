import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import User from "@/models/User";

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const currentPassword =
      body.currentPassword;

    const newPassword =
      body.newPassword;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          error:
            "Current password and new password are required",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          error:
            "New password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          error:
            "New password must be different from the current password",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(
      currentUser.userId
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const validPassword =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!validPassword) {
      return NextResponse.json(
        {
          error:
            "Current password is incorrect",
        },
        { status: 400 }
      );
    }

    user.password =
      await bcrypt.hash(newPassword, 12);

    await user.save();

    return NextResponse.json({
      message:
        "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to change password",
      },
      { status: 500 }
    );
  }
}