import Creditor from "../models/Creditor.model.js";

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
export const addCredit = async ({ customerName, amount }) => {
  let creditor = await Creditor.findOne({ customerName });

  if (!creditor) {
    creditor = await Creditor.create({
      customerName,
      totalCredit: amount,
      balance: amount,
    });
  } else {
    creditor.totalCredit += amount;
    creditor.balance += amount;
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

  creditor.totalPaid += amount;
  creditor.balance -= amount;

  await creditor.save();

  res.json({ success: true, data: creditor });
};
