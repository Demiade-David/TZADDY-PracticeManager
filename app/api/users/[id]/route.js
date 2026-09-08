import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import { requirePermission } from "@/lib/authorization";
import User from "@/models/User";

export async function PATCH(request, { params }) {
  try {
    const currentUser = await requirePermission("staffManagement");

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const body = await request.json();

    const updates = {};

    if (body.name !== undefined) {
      updates.name = body.name.trim();
    }

    if (body.role !== undefined) {
      if (
        !["admin", "manager", "staff"].includes(
          body.role
        )
      ) {
        return NextResponse.json(
          { error: "Invalid role" },
          { status: 400 }
        );
      }

      updates.role = body.role;
    }

    if (body.active !== undefined) {
      updates.active = Boolean(body.active);
    }

    if (
      body.password !== undefined &&
      body.password
    ) {
      if (body.password.length < 8) {
        return NextResponse.json(
          {
            error:
              "Password must be at least 8 characters",
          },
          { status: 400 }
        );
      }

      updates.password = await bcrypt.hash(
        body.password,
        12
      );
    }

    if (
      id === currentUser.userId &&
      updates.active === false
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot deactivate your own account",
        },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    )
      .select("-password")
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("PATCH user error:", error);

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
      { error: "Unable to update staff account" },
      { status: 500 }
    );
  }
}