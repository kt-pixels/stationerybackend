// ==========================
// src/controllers/sale.controller.js
// ==========================
import Sale from "../models/Sale.model.js";
import Product from "../models/Product.model.js";

import { generateNumber } from "../src/utils/generateNumber.js";

/**
 * @desc    Create sale (billing) + deduct stock + calculate profit
 * @route   POST /api/sales
 */

export const createSale = async (req, res) => {
  try {
    const { items } = req.body;

    let profit = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }
      profit += (item.sellingPrice - item.costPrice) * item.quantity;
    }

    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    const invoiceNumber = await generateNumber("SALE");

    const sale = await Sale.create({
      ...req.body,
      invoiceNumber,
      profit,
    });

    res.status(201).json({ success: true, data: sale });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get all sales
 * @route   GET /api/sales
 */
export const getAllSales = async (req, res) => {
  try {
    let { from, to } = req.query;

    const filter = {};

    // ✅ DEFAULT = TODAY
    if (!from && !to) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      filter.saleDate = { $gte: start, $lte: end };
    }

    // 📅 CUSTOM DATE RANGE
    if (from && to) {
      filter.saleDate = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const sales = await Sale.find(filter)
      .populate("items.product", "name category brand")
      .sort({ saleDate: -1 });

    res.json({ success: true, data: sales });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get single sale
 * @route   GET /api/sales/:id
 */
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate(
      "items.product",
      "name category brand"
    );

    if (!sale)
      return res
        .status(404)
        .json({ success: false, message: "Sale not found" });

    res.json({ success: true, data: sale });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Return sale item (partial/full)
 * @route   POST /api/sales/:id/return
 */
export const returnSaleItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    const item = sale.items.find((i) => i.product.toString() === productId);

    if (!item || item.quantity < quantity) {
      return res.status(400).json({ message: "Invalid return quantity" });
    }

    // Update stock
    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: quantity },
    });

    // Update sale item
    item.quantity -= quantity;

    // Recalculate totals
    const refundAmount = quantity * item.sellingPrice;
    const profitLoss = quantity * (item.sellingPrice - item.costPrice);

    sale.totalAmount -= refundAmount;
    sale.profit -= profitLoss;

    // Remove item if qty becomes 0
    sale.items = sale.items.filter((i) => i.quantity > 0);

    await sale.save();

    res.json({ success: true, data: sale });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
