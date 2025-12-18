// ==========================
// src/routes/dashboard.routes.js (SECURED)
// ==========================
import express from "express";
import {
  getDashboardKPIs,
  getSalesTrend,
  getProductPerformance,
  getExpenseVsRevenue,
} from "../controllers/dashboard.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("OWNER"));

router.get("/kpis", getDashboardKPIs);
router.get("/sales-trend", getSalesTrend);
router.get("/product-performance", getProductPerformance);
router.get("/expense-vs-revenue", getExpenseVsRevenue);

export default router;
