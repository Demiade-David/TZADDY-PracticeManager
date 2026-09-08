import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    documentType: {
      type: String,
      required: true,
      trim: true,
    },

    engagement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Engagement",
    },

    filing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Filing",
    },

    fileUrl: {
      type: String,
      trim: true,
    },

    fileName: {
      type: String,
      trim: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Document ||
  mongoose.model("Document", DocumentSchema);