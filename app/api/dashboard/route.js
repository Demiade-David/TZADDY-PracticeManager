import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";

import Client from "@/models/Client";
import Engagement from "@/models/Engagement";
import Filing from "@/models/Filing";
import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";
import Document from "@/models/Document";

export async function GET() {
  try {
    await requireAuth();
    await connectDB();

    const now = new Date();

    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const [
      activeClients,
      openEngagements,
      overdueFilings,
      upcomingFilings,
      filedFilings,
      invoiceTotals,
      paymentTotals,
      documentCount,
      recentClients,
      recentEngagements,
      recentFilings,
      recentPayments,
      recentDocuments,
    ] = await Promise.all([
      Client.countDocuments({ status: "Active" }),

      Engagement.countDocuments({
        status: {
          $nin: ["Completed", "Cancelled"],
        },
      }),

      Filing.countDocuments({
        dueDate: { $lt: now },
        status: {
          $nin: ["Filed", "Cancelled"],
        },
      }),

      Filing.countDocuments({
        dueDate: {
          $gte: now,
          $lte: sevenDaysFromNow,
        },
        status: {
          $nin: ["Filed", "Cancelled"],
        },
      }),

      Filing.countDocuments({
        status: "Filed",
      }),

      Invoice.aggregate([
        {
          $match: {
            status: { $ne: "Cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            totalInvoiced: { $sum: "$amount" },
            totalPaid: { $sum: "$amountPaid" },
          },
        },
      ]),

      Payment.aggregate([
        {
          $group: {
            _id: null,
            totalCollected: { $sum: "$amount" },
          },
        },
      ]),

      Document.countDocuments(),

      Client.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name createdAt")
        .lean(),

      Engagement.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("client", "name")
        .select("name status client createdAt")
        .lean(),

      Filing.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("client", "name")
        .select("taxType filingPeriod status client createdAt")
        .lean(),

      Payment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("client", "name")
        .select("amount client paymentDate createdAt")
        .lean(),

      Document.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("client", "name")
        .select("name documentType client createdAt")
        .lean(),
    ]);

    const totals = invoiceTotals[0] || {
      totalInvoiced: 0,
      totalPaid: 0,
    };

    const totalCollected =
      paymentTotals[0]?.totalCollected || 0;

    const outstanding =
      totals.totalInvoiced - totals.totalPaid;

    const recentActivity = [
      ...recentClients.map((item) => ({
        type: "client",
        title: "New client added",
        description: item.name,
        date: item.createdAt,
      })),

      ...recentEngagements.map((item) => ({
        type: "engagement",
        title: "Engagement created",
        description: `${item.name} · ${item.client?.name || "Client"}`,
        date: item.createdAt,
      })),

      ...recentFilings.map((item) => ({
        type: "filing",
        title: "Filing created",
        description: `${item.taxType} · ${item.client?.name || "Client"}`,
        date: item.createdAt,
      })),

      ...recentPayments.map((item) => ({
        type: "payment",
        title: "Payment recorded",
        description: `₦${Number(item.amount || 0).toLocaleString()} · ${
          item.client?.name || "Client"
        }`,
        date: item.createdAt,
      })),

      ...recentDocuments.map((item) => ({
        type: "document",
        title: "Document uploaded",
        description: `${item.name} · ${item.client?.name || "Client"}`,
        date: item.createdAt,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )
      .slice(0, 8);

    return NextResponse.json({
      stats: {
        activeClients,
        openEngagements,
        overdueFilings,
        upcomingFilings,
        filedFilings,
        totalInvoiced: totals.totalInvoiced,
        totalCollected,
        outstanding,
        documentCount,
      },

      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to load dashboard" },
      { status: 500 }
    );
  }
}