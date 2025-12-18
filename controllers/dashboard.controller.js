// ==========================
// src/controllers/dashboard.controller.js
// ==========================
import Sale from "../models/Sale.model.js";
import Product from "../models/Product.model.js";
import Expense from "../models/Expense.model.js";

/**
 * @desc    Dashboard KPIs (Today Sales, Profit, Low Stock)
 * @route   GET /api/dashboard/kpis
 */
export const getDashboardKPIs = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const todaySalesAgg = await Sale.aggregate([
      { $match: { saleDate: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          totalProfit: { $sum: "$profit" },
        },
      },
    ]);

    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ["$stock", "$minStock"] },
      isActive: true,
    });

    res.json({
      success: true,
      data: {
        todaySales: todaySalesAgg[0]?.totalSales || 0,
        todayProfit: todaySalesAgg[0]?.totalProfit || 0,
        totalProducts: await Product.countDocuments({ isActive: true }),
        lowStockAlerts: lowStockCount,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Monthly / Yearly Sales Graph
 * @route   GET /api/dashboard/sales-trend
 */
export const getSalesTrend = async (req, res) => {
  try {
    const sales = await Sale.aggregate([
      {
        $group: {
          _id: { month: { $month: "$saleDate" } },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    res.json({ success: true, data: sales });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Top & Slow Moving Products
 * @route   GET /api/dashboard/product-performance
 */
export const getProductPerformance = async (req, res) => {
  try {
    const performance = await Sale.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQty: { $sum: "$items.quantity" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.name",
          totalQty: 1,
        },
      },
      { $sort: { totalQty: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        topSelling: performance.slice(0, 5),
        slowMoving: performance.slice(-5),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Expense vs Revenue
 * @route   GET /api/dashboard/expense-vs-revenue
 */
export const getExpenseVsRevenue = async (req, res) => {
  try {
    const revenue = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const expenses = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      success: true,
      data: {
        revenue: revenue[0]?.total || 0,
        expenses: expenses[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
