// ==========================
// src/routes/sale.routes.js (SECURED)
// ==========================
import express from "express";
import {
  createSale,
  getAllSales,
  getSaleById,
  // returnSaleItem,
} from "../controllers/sale.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { returnSaleItem } from "../controllers/saleReturn.controller.js";

const router = express.Router();

router.use(protect);

router.post("/", authorize("OWNER", "STAFF"), createSale);
router.get("/", authorize("OWNER"), getAllSales);
router.get("/:id", authorize("OWNER"), getSaleById);
// router.post("/:id/return", authorize("OWNER"), returnSaleItem);

router.post("/:saleId/return", authorize("OWNER", "STAFF"), returnSaleItem);

export default router;
