import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import Engagement from "@/models/Engagement";

function unauthorizedResponse(error) {
  if (error.message === "Unauthorized") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return null;
}

async function populateEngagement(id) {
  return Engagement.findById(id)
    .populate("client", "name clientType")
    .populate("assignedTo", "name email")
    .populate("manager", "name email")
    .lean();
}

export async function GET() {
  try {
    await requireAuth();
    await connectDB();

    const engagements = await Engagement.find()
      .populate("client", "name clientType")
      .populate("assignedTo", "name email")
      .populate("manager", "name email")
      .sort({ dueDate: 1, createdAt: -1 })
      .lean();

    return NextResponse.json(engagements);
  } catch (error) {
    console.error("GET engagements error:", error);

    return (
      unauthorizedResponse(error) ||
      NextResponse.json(
        { error: "Unable to load engagements" },
        { status: 500 }
      )
    );
  }
}

export async function POST(request) {
  try {
    await requireAuth();
    await connectDB();

    const body = await request.json();

    if (!body.client) {
      return NextResponse.json(
        { error: "Client is required" },
        { status: 400 }
      );
    }

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "Engagement name is required" },
        { status: 400 }
      );
    }

    if (!body.service?.trim()) {
      return NextResponse.json(
        { error: "Service is required" },
        { status: 400 }
      );
    }

    const engagement = await Engagement.create({
      client: body.client,
      name: body.name.trim(),
      service: body.service.trim(),
      startDate: body.startDate || undefined,
      dueDate: body.dueDate || undefined,
      status: body.status || "Not Started",
      priority: body.priority || "Medium",
      fee: body.fee === "" || body.fee == null ? 0 : Number(body.fee),
      notes: body.notes || "",
      assignedTo: body.assignedTo || undefined,
      manager: body.manager || undefined,
    });

    const populatedEngagement = await populateEngagement(
      engagement._id
    );

    return NextResponse.json(populatedEngagement, { status: 201 });
  } catch (error) {
    console.error("POST engagement error:", error);

    return (
      unauthorizedResponse(error) ||
      NextResponse.json(
        { error: "Unable to create engagement" },
        { status: 500 }
      )
    );
  }
}

export async function PATCH(request) {
  try {
    await requireAuth();
    await connectDB();

    const body = await request.json();

    if (!body.id || !body.status) {
      return NextResponse.json(
        { error: "Engagement id and status are required" },
        { status: 400 }
      );
    }

    const engagement = await Engagement.findByIdAndUpdate(
      body.id,
      { status: body.status },
      { new: true, runValidators: true }
    );

    if (!engagement) {
      return NextResponse.json(
        { error: "Engagement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      await populateEngagement(engagement._id)
    );
  } catch (error) {
    console.error("PATCH engagement error:", error);

    return (
      unauthorizedResponse(error) ||
      NextResponse.json(
        { error: "Unable to update engagement" },
        { status: 500 }
      )
    );
  }
}
