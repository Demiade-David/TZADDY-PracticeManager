import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Filing from "@/models/Filing";
import { requireAuth } from "@/lib/auth";

const allowedStatuses = [
  "Not Started",
  "In Progress",
  "Awaiting Client",
  "Ready to File",
  "Filed",
  "Overdue",
  "Cancelled",
];

export async function GET() {
  try {
    await requireAuth();
    await connectDB();

    const filings = await Filing.find()
      .populate("client", "name clientType")
      .populate("assignedTo", "name email")
      .populate("evidenceDocument")
      .sort({ dueDate: 1 })
      .lean();

    return NextResponse.json(filings);
  } catch (error) {
    console.error("GET filings error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to load filings" },
      { status: 500 }
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

    if (!body.taxType?.trim()) {
      return NextResponse.json(
        { error: "Tax type is required" },
        { status: 400 }
      );
    }

    if (!body.filingPeriod?.trim()) {
      return NextResponse.json(
        { error: "Filing period is required" },
        { status: 400 }
      );
    }

    if (!body.dueDate) {
      return NextResponse.json(
        { error: "Due date is required" },
        { status: 400 }
      );
    }

    const filing = await Filing.create({
      client: body.client,
      taxType: body.taxType.trim(),
      filingPeriod: body.filingPeriod.trim(),
      dueDate: body.dueDate,
      assignedTo: body.assignedTo || undefined,
      status: body.status || "Not Started",
      filingDate: body.filingDate || undefined,
      notes: body.notes || "",
    });

    const populatedFiling = await Filing.findById(
      filing._id
    )
      .populate("client", "name clientType")
      .populate("assignedTo", "name email")
      .lean();

    return NextResponse.json(
      populatedFiling,
      { status: 201 }
    );
  } catch (error) {
    console.error("POST filing error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to create filing" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await requireAuth();
    await connectDB();

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Filing ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(body.id)) {
      return NextResponse.json(
        { error: "Invalid filing ID" },
        { status: 400 }
      );
    }

    if (
      !body.status ||
      !allowedStatuses.includes(body.status)
    ) {
      return NextResponse.json(
        { error: "Invalid filing status" },
        { status: 400 }
      );
    }

    const update = {
      status: body.status,
    };

    if (body.status === "Filed") {
      update.filingDate =
        body.filingDate || new Date();
    }

    if (body.status !== "Filed") {
      update.filingDate = undefined;
    }

    const filing =
      await Filing.findByIdAndUpdate(
        body.id,
        update,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate("client", "name clientType")
        .populate("assignedTo", "name email")
        .populate("evidenceDocument")
        .lean();

    if (!filing) {
      return NextResponse.json(
        { error: "Filing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(filing);
  } catch (error) {
    console.error("PATCH filing error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to update filing" },
      { status: 500 }
    );
  }
}