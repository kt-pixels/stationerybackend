import Sale from "../models/Sale.model.js";
import Product from "../models/Product.model.js";
import { generateNumber } from "../src/utils/generateNumber.js";

import { addCredit } from "./creditor.controller.js";

/**
 * CREATE SALE
 * POST /api/sales
 */
export const createSale = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Sale must have at least one item",
      });
    }

    let profit = 0;
    const saleItems = [];

    // 🔍 Validate stock + calculate profit
    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Product not found",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      profit += (item.sellingPrice - product.costPrice) * item.quantity;

      // ✅ FIX: include costPrice
      saleItems.push({
        product: product._id,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice,
        costPrice: product.costPrice,
      });
    }

    // 🔁 Deduct stock
    for (const item of saleItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    const invoiceNumber = await generateNumber("SALE");
    const isCredit = req.body.paymentMode === "Credit";

    const sale = await Sale.create({
      ...req.body,
      items: saleItems,
      invoiceNumber,
      profit,
      paymentStatus: isCredit ? "UNPAID" : "PAID",
      dueAmount: isCredit ? req.body.totalAmount : 0,
    });

    if (isCredit) {
      await addCredit({
        customerName: req.body.customerName,
        amount: req.body.totalAmount,
        saleId: sale._id,
      });
    }

    res.status(201).json({
      success: true,
      data: sale,
    });
  } catch (err) {
    console.error("CREATE SALE ERROR:", err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET SALES
 */
export const getAllSales = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};

    if (!from && !to) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      filter.saleDate = { $gte: start, $lte: end };
    }

    if (from && to) {
      const start = new Date(from);
      start.setHours(0, 0, 0, 0);

      const end = new Date(to);
      end.setHours(23, 59, 59, 999);

      filter.saleDate = {
        $gte: start,
        $lte: end,
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
 * GET SINGLE SALE
 */
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate(
      "items.product",
      "name category brand"
    );

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    res.json({ success: true, data: sale });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
