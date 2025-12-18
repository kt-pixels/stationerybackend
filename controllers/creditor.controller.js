import Creditor from "../models/Creditor.model.js";
import Sale from "../models/Sale.model.js";

/**
 * GET ALL CREDITORS
 */
export const getCreditors = async (req, res) => {
  const creditors = await Creditor.find().sort({ balance: -1 });
  res.json({ success: true, data: creditors });
};

/**
 * ADD / UPDATE CREDIT (WHEN SALE ON CREDIT)
 */
export const addCredit = async ({ customerName, amount, saleId }) => {
  let creditor = await Creditor.findOne({ customerName });

  if (!creditor) {
    creditor = await Creditor.create({
      customerName,
      totalCredit: amount,
      balance: amount,
      sales: [saleId],
    });
  } else {
    creditor.totalCredit += amount;
    creditor.balance += amount;
    creditor.sales.push(saleId);
    await creditor.save();
  }
};

/**
 * PAY CREDIT
 */

export const payCredit = async (req, res) => {
  const { amount } = req.body;

  const creditor = await Creditor.findById(req.params.id);
  if (!creditor) return res.status(404).json({ message: "Creditor not found" });

  let remaining = amount;

  // 🔁 Auto-settle sales FIFO
  for (const saleId of creditor.sales) {
    if (remaining <= 0) break;

    const sale = await Sale.findById(saleId);
    if (!sale || sale.paymentStatus === "PAID") continue;

    if (remaining >= sale.dueAmount) {
      remaining -= sale.dueAmount;
      sale.dueAmount = 0;
      sale.paymentStatus = "PAID";
    } else {
      sale.dueAmount -= remaining;
      remaining = 0;
    }

    await sale.save();
  }

  creditor.totalPaid += amount;
  creditor.balance -= amount;

  await creditor.save();

  res.json({ success: true, data: creditor });
};
