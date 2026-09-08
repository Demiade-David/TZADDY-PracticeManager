import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import { requireAuth } from "@/lib/auth";

const allowedStatuses = [
  "Draft",
  "Sent",
  "Partially Paid",
  "Paid",
  "Overdue",
  "Cancelled",
];

export async function GET() {
  try {
    await requireAuth();
    await connectDB();

    const invoices = await Invoice.find()
      .populate("client", "name clientType")
      .populate("engagement", "name service")
      .populate("createdBy", "name email")
      .sort({ invoiceDate: -1 })
      .lean();

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("GET invoices error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to load invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth();
    await connectDB();

    const body = await request.json();

    if (!body.client) {
      return NextResponse.json(
        { error: "Client is required" },
        { status: 400 }
      );
    }

    if (!body.description?.trim()) {
      return NextResponse.json(
        { error: "Invoice description is required" },
        { status: 400 }
      );
    }

    if (!body.invoiceNumber?.trim()) {
      return NextResponse.json(
        { error: "Invoice number is required" },
        { status: 400 }
      );
    }

    if (!body.dueDate) {
      return NextResponse.json(
        { error: "Due date is required" },
        { status: 400 }
      );
    }

    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json(
        { error: "A valid invoice amount is required" },
        { status: 400 }
      );
    }

    const existingInvoice = await Invoice.findOne({
      invoiceNumber: body.invoiceNumber.trim(),
    });

    if (existingInvoice) {
      return NextResponse.json(
        { error: "Invoice number already exists" },
        { status: 409 }
      );
    }

    const invoice = await Invoice.create({
      client: body.client,
      engagement: body.engagement || undefined,
      invoiceNumber: body.invoiceNumber.trim(),
      description: body.description.trim(),
      invoiceDate: body.invoiceDate || new Date(),
      dueDate: body.dueDate,
      amount,
      amountPaid: 0,
      status: body.status || "Draft",
      notes: body.notes || "",
      createdBy: user.userId,
    });

    const populatedInvoice =
      await Invoice.findById(invoice._id)
        .populate("client", "name clientType")
        .populate("engagement", "name service")
        .populate("createdBy", "name email")
        .lean();

    return NextResponse.json(
      populatedInvoice,
      { status: 201 }
    );
  } catch (error) {
    console.error("POST invoice error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to create invoice" },
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
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(body.id)) {
      return NextResponse.json(
        { error: "Invalid invoice ID" },
        { status: 400 }
      );
    }

    if (
      body.status &&
      !allowedStatuses.includes(body.status)
    ) {
      return NextResponse.json(
        { error: "Invalid invoice status" },
        { status: 400 }
      );
    }

    const invoice =
      await Invoice.findByIdAndUpdate(
        body.id,
        {
          ...(body.status && {
            status: body.status,
          }),
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate("client", "name clientType")
        .populate("engagement", "name service")
        .populate("createdBy", "name email")
        .lean();

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("PATCH invoice error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to update invoice" },
      { status: 500 }
    );
  }
}