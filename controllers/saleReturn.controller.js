import Sale from "../models/Sale.model.js";
import Product from "../models/Product.model.js";
import SaleReturn from "../models/SaleReturn.model.js";
import { generateNumber } from "../utils/generateNumber.js";

/**
 * RETURN SALE ITEM
 * POST /api/sales/:saleId/return
 */
export const returnSaleItem = async (req, res) => {
  try {
    const { saleId } = req.params;
    const { productId, quantity, reason } = req.body;

    const sale = await Sale.findById(saleId).populate("items.product");
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    const item = sale.items.find((i) => i.product._id.toString() === productId);

    if (!item || quantity > item.quantity) {
      return res.status(400).json({
        message: "Invalid return quantity",
      });
    }

    // 🔁 Stock back
    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: quantity },
    });

    const refundAmount = item.sellingPrice * quantity;
    const profitLoss = (item.sellingPrice - item.costPrice) * quantity;

    // 🔢 Save return record
    const returnNumber = await generateNumber("RET");

    const saleReturn = await SaleReturn.create({
      returnNumber,
      sale: sale._id,
      product: productId,
      quantity,
      refundAmount,
      reason,
    });

    // 🧮 Adjust sale
    sale.totalAmount -= refundAmount;
    sale.profit -= profitLoss;
    item.quantity -= quantity;

    if (item.quantity === 0) {
      sale.items = sale.items.filter(
        (i) => i.product._id.toString() !== productId
      );
    }

    await sale.save();

    res.json({
      success: true,
      message: "Sale item returned successfully",
      data: saleReturn,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
