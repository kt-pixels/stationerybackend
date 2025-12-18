import mongoose from "mongoose";

const creditorSchema = new mongoose.Schema(
  {
    sales: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sale",
      },
    ],

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    totalCredit: {
      type: Number,
      default: 0,
    },

    totalPaid: {
      type: Number,
      default: 0,
    },

    balance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Creditor", creditorSchema);
