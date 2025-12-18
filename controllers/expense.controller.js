import Expense from "../models/Expense.model.js";

/**
 * @desc    Create expense
 * @route   POST /api/expenses
 * @access  OWNER
 */
export const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * @desc    Get all expenses
 * @route   GET /api/expenses
 * @access  OWNER
 */
export const getAllExpenses = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};

    if (from && to) {
      filter.date = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json({ success: true, data: expenses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Delete expense
 * @route   DELETE /api/expenses/:id
 * @access  OWNER
 */
export const deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
