import mongoose from "mongoose";

const EngagementSchema = new mongoose.Schema(
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

    service: {
      type: String,
      required: true,
      trim: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    startDate: {
      type: Date,
    },

    dueDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: [
        "Not Started",
        "In Progress",
        "On Hold",
        "Completed",
        "Cancelled",
      ],
      default: "Not Started",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },

    fee: {
      type: Number,
      default: 0,
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

export default mongoose.models.Engagement ||
  mongoose.model("Engagement", EngagementSchema);