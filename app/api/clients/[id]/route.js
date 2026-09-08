import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Client from "@/models/Client";
import { requireAuth } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    await requireAuth();
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid client ID" },
        { status: 400 }
      );
    }

    const client = await Client.findById(id).lean();

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("GET client error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to load client" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireAuth();
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid client ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "Client name is required" },
        { status: 400 }
      );
    }

    const client = await Client.findByIdAndUpdate(
      id,
      {
        name: body.name.trim(),
        clientType: body.clientType || "Company",
        email: body.email || "",
        phone: body.phone || "",
        address: body.address || "",
        contactPerson: body.contactPerson || "",
        cacNumber: body.cacNumber || "",
        tin: body.tin || "",
        services: body.services || [],
        status: body.status || "Active",
        notes: body.notes || "",
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("PATCH client error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to update client" },
      { status: 500 }
    );
  }
}