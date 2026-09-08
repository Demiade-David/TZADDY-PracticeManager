import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { requirePermission } from "@/lib/authorization";
import Practice from "@/models/Practice";

export async function GET() {
  try {
    await requirePermission("practiceSettings");

    await connectDB();

    const practice = await Practice.findOne().lean();

    return NextResponse.json(
      practice || {
        name: "Tzaddy Consulting",
        email: "",
        phone: "",
        address: "",
        website: "",
        registrationNumber: "",
        taxIdentificationNumber: "",
        logoUrl: "",
      },
    );
  } catch (error) {
    console.error("GET practice error:", error);

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json(
        { error: error.message },
        {
          status: error.message === "Unauthorized" ? 401 : 403,
        },
      );
    }

    return NextResponse.json(
      { error: "Unable to load practice information" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    await requirePermission("practiceSettings");
    await connectDB();

    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "Practice name is required" },
        { status: 400 },
      );
    }

    const practice = await Practice.findOneAndUpdate(
      {},
      {
        name: body.name.trim(),
        email: body.email?.trim() || "",
        phone: body.phone?.trim() || "",
        address: body.address?.trim() || "",
        website: body.website?.trim() || "",
        registrationNumber: body.registrationNumber?.trim() || "",
        taxIdentificationNumber: body.taxIdentificationNumber?.trim() || "",
        logoUrl: body.logoUrl?.trim() || "",
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    ).lean();

    return NextResponse.json(practice);
  } catch (error) {
    console.error("PUT practice error:", error);

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json(
        { error: error.message },
        {
          status: error.message === "Unauthorized" ? 401 : 403,
        },
      );
    }

    return NextResponse.json(
      { error: "Unable to save practice information" },
      { status: 500 },
    );
  }
}
