import Sale from "../models/Sale.model.js";
import Product from "../models/Product.model.js";
import SaleReturn from "../models/SaleReturn.model.js";
import { generateNumber } from "../src/utils/generateNumber.js";

export const returnSaleItem = async (req, res) => {
  try {
    const { saleId } = req.params;
    const { productId, quantity, reason } = req.body;

    // 🔍 Find Sale
    const sale = await Sale.findById(saleId).populate("items.product");
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // 🔍 Check product exists in sale
    const saleItem = sale.items.find(
      (i) => i.product._id.toString() === productId
    );

    if (!saleItem) {
      return res.status(400).json({
        message: "This product was not part of the sale",
      });
    }

    // ❌ Quantity validation
    if (quantity > saleItem.quantity) {
      return res.status(400).json({
        message: "Return quantity exceeds sold quantity",
      });
    }

    // 💰 Refund calculation
    const refundAmount = saleItem.sellingPrice * quantity;
    const profitReduction =
      (saleItem.sellingPrice - saleItem.costPrice) * quantity;

    // 🔁 Stock back
    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: quantity },
    });

    // 🔢 Generate return number
    const returnNumber = await generateNumber("RET");

    // 🧾 Save return record
    const saleReturn = await SaleReturn.create({
      returnNumber,
      sale: sale._id,
      product: productId,
      quantity,
      refundAmount,
      reason,
    });

    // 🧮 Adjust sale totals
    sale.totalAmount -= refundAmount;
    sale.profit -= profitReduction;

    saleItem.quantity -= quantity;

    // Optional: remove item if qty becomes 0
    if (saleItem.quantity === 0) {
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
    res.status(400).json({ message: err.message });
  }
};
