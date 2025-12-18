// ==========================
// src/models/Product.model.js
// ==========================
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["Pen", "Notebook", "Paper", "Art", "Office", "School", "Other"],
      index: true,
    },

    brand: {
      type: String,
      trim: true,
    },

    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    profitMargin: {
      type: Number,
      default: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    minStock: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },

    supplierName: {
      type: String,
      trim: true,
    },

    barcode: {
      type: String,
      unique: true,
      sparse: true, // barcode optional but unique
    },

    gst: {
      type: Number,
      default: 0,
      enum: [0, 5, 12, 18, 28],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================
// MIDDLEWARES
// ==========================

// Auto-calculate profit margin before save
productSchema.pre("save", function (next) {
  if (this.costPrice > 0) {
    this.profitMargin =
      ((this.sellingPrice - this.costPrice) / this.costPrice) * 100;
  } else {
    this.profitMargin = 0;
  }
  next();
});

// ==========================
// VIRTUALS
// ==========================

// Low stock virtual flag
productSchema.virtual("isLowStock").get(function () {
  return this.stock <= this.minStock;
});

// ==========================
// INDEXES
// ==========================
productSchema.index({ name: 1, category: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ minStock: 1 });

// ==========================
// EXPORT
// ==========================
const Product = mongoose.model("Product", productSchema);
export default Product;
