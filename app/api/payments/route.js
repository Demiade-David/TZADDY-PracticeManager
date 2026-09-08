import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payments";
import Invoice from "@/models/Invoice";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();
    await connectDB();

    const payments = await Payment.find()
      .populate("invoice", "invoiceNumber description amount")
      .populate("client", "name clientType")
      .populate("recordedBy", "name email")
      .sort({ paymentDate: -1 })
      .lean();

    return NextResponse.json(payments);
  } catch (error) {
    console.error("GET payments error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to load payments" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth();
    await connectDB();

    const body = await request.json();

    if (!body.invoice) {
      return NextResponse.json(
        { error: "Invoice is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(body.invoice)) {
      return NextResponse.json(
        { error: "Invalid invoice ID" },
        { status: 400 }
      );
    }

    const invoice = await Invoice.findById(body.invoice);

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    if (invoice.status === "Cancelled") {
      return NextResponse.json(
        { error: "Cannot record payment against a cancelled invoice" },
        { status: 400 }
      );
    }

    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Payment amount must be greater than zero" },
        { status: 400 }
      );
    }

    const currentPaid = invoice.amountPaid || 0;
    const outstanding = invoice.amount - currentPaid;

    if (amount > outstanding) {
      return NextResponse.json(
        {
          error: `Payment exceeds the outstanding balance of ₦${outstanding.toLocaleString()}`,
        },
        { status: 400 }
      );
    }

    const payment = await Payment.create({
      invoice: invoice._id,
      client: invoice.client,
      amount,
      paymentDate: body.paymentDate || new Date(),
      paymentMethod:
        body.paymentMethod || "Bank Transfer",
      reference: body.reference || "",
      notes: body.notes || "",
      recordedBy: user.userId,
    });

    const newAmountPaid = currentPaid + amount;

    let newStatus = invoice.status;

    if (newAmountPaid >= invoice.amount) {
      newStatus = "Paid";
    } else if (newAmountPaid > 0) {
      newStatus = "Partially Paid";
    }

    invoice.amountPaid = newAmountPaid;
    invoice.status = newStatus;

    await invoice.save();

    const populatedPayment =
      await Payment.findById(payment._id)
        .populate(
          "invoice",
          "invoiceNumber description amount"
        )
        .populate("client", "name clientType")
        .populate("recordedBy", "name email")
        .lean();

    return NextResponse.json(
      populatedPayment,
      { status: 201 }
    );
  } catch (error) {
    console.error("POST payment error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to record payment" },
      { status: 500 }
    );
  }
}