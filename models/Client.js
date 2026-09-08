import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    clientType: {
      type: String,
      enum: ["Company", "Business Name", "Individual"],
      default: "Company",
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    contactPerson: {
      type: String,
      trim: true,
    },

    cacNumber: {
      type: String,
      trim: true,
    },

    tin: {
      type: String,
      trim: true,
    },

    services: [
      {
        type: String,
        trim: true,
      },
    ],

    status: {
      type: String,
      enum: ["Active", "Inactive", "Off-boarded"],
      default: "Active",
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

export default mongoose.models.Client ||
  mongoose.model("Client", ClientSchema);