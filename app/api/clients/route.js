import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Client from "@/models/Client";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();
    await connectDB();

    const clients = await Client.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(clients);
  } catch (error) {
    console.error("GET clients error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to load clients" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await requireAuth();
    await connectDB();

    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "Client name is required" },
        { status: 400 }
      );
    }

    const client = await Client.create({
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
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("POST client error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to create client" },
      { status: 500 }
    );
  }
}