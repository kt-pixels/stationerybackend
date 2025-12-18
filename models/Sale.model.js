// ==========================
// src/models/Sale.model.js
// ==========================
import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      trim: true,
      default: "Walk-in",
    },
    items: {
      type: [saleItemSchema],
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    gst: {
      type: Number,
      default: 0,
      enum: [0, 5, 12, 18, 28],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    profit: {
      type: Number,
      required: true,
    },
    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Card", "Credit"],
      required: true,
    },
    saleDate: {
      type: Date,
      default: Date.now,
    },
    paymentStatus: {
      type: String,
      enum: ["PAID", "UNPAID"],
      default: "PAID",
    },

    dueAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Sale = mongoose.model("Sale", saleSchema);
export default Sale;
