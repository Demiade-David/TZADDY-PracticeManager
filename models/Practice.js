import mongoose from "mongoose";

const PracticeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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

    website: {
      type: String,
      trim: true,
    },

    registrationNumber: {
      type: String,
      trim: true,
    },

    taxIdentificationNumber: {
      type: String,
      trim: true,
    },

    logoUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Practice ||
  mongoose.model("Practice", PracticeSchema);