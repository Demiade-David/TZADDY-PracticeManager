import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Document from "@/models/Document";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();
    await connectDB();

    const documents = await Document.find()
      .populate("client", "name clientType")
      .populate("engagement", "name service status")
      .populate("filing", "taxType filingPeriod status")
      .populate("uploadedBy", "name email")
      .sort({ uploadedAt: -1 })
      .lean();

    return NextResponse.json(documents);
  } catch (error) {
    console.error("GET documents error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to load documents" },
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

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "Document name is required" },
        { status: 400 }
      );
    }

    if (!body.documentType?.trim()) {
      return NextResponse.json(
        { error: "Document type is required" },
        { status: 400 }
      );
    }

    const document = await Document.create({
      client: body.client,
      name: body.name.trim(),
      documentType: body.documentType.trim(),
      engagement: body.engagement || undefined,
      filing: body.filing || undefined,
      fileUrl: body.fileUrl || "",
      fileName: body.fileName || "",
      uploadedBy: user.userId,
      uploadedAt: new Date(),
      notes: body.notes || "",
    });

    const populatedDocument =
      await Document.findById(document._id)
        .populate("client", "name clientType")
        .populate("engagement", "name service status")
        .populate("filing", "taxType filingPeriod status")
        .populate("uploadedBy", "name email")
        .lean();

    return NextResponse.json(
      populatedDocument,
      { status: 201 }
    );
  } catch (error) {
    console.error("POST document error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to create document" },
      { status: 500 }
    );
  }
}