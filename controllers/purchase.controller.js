// ==========================
// src/controllers/purchase.controller.js
// ==========================
import Purchase from "../models/Purchase.model.js";
import Product from "../models/Product.model.js";
import { generateNumber } from "../src/utils/generateNumber.js";

/**
 * @desc    Create purchase & increase stock
 * @route   POST /api/purchases
 */
// src/controllers/purchase.controller.js

export const createPurchase = async (req, res) => {
  try {
    const { items, supplierName, gst, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Purchase items are required",
      });
    }

    // Increase stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    // ✅ AUTO BILL NUMBER
    const billNumber = await generateNumber("PUR");

    // ✅ SAVE WITH GENERATED NUMBER
    const purchase = await Purchase.create({
      billNumber,
      supplierName,
      items,
      gst,
      totalAmount,
    });

    res.status(201).json({
      success: true,
      data: purchase,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * @desc    Get all purchases
 * @route   GET /api/purchases
 */
export const getAllPurchases = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};

    if (from && to) {
      filter.purchaseDate = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const purchases = await Purchase.find(filter)
      .populate("items.product", "name category")
      .sort({ purchaseDate: -1 });

    res.json({ success: true, data: purchases });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Get single purchase
 * @route   GET /api/purchases/:id
 */
export const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate(
      "items.product",
      "name category brand"
    );

    if (!purchase)
      return res
        .status(404)
        .json({ success: false, message: "Purchase not found" });

    res.json({ success: true, data: purchase });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
