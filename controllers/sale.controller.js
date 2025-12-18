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
    let profit = 0;

    // 🔍 Validate stock & calculate profit
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product?.name}`,
        });
      }

      profit += (item.sellingPrice - product.costPrice) * item.quantity;
    }

    // 🔁 Deduct stock
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

    if (req.body.paymentMode !== "Cash") {
      await addCredit({
        customerName: req.body.customerName,
        amount: req.body.totalAmount,
      });
    }

    res.status(201).json({ success: true, data: sale });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET SALES
 * GET /api/sales
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
 * GET SINGLE SALE
 * GET /api/sales/:id
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
