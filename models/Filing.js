import mongoose from "mongoose";

const FilingSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    taxType: {
      type: String,
      required: true,
      trim: true,
    },

    filingPeriod: {
      type: String,
      required: true,
      trim: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: [
        "Not Started",
        "In Progress",
        "Awaiting Client",
        "Ready to File",
        "Filed",
        "Overdue",
        "Cancelled",
      ],
      default: "Not Started",
    },

    filingDate: {
      type: Date,
    },

    evidenceDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
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

export default mongoose.models.Filing ||
  mongoose.model("Filing", FilingSchema);