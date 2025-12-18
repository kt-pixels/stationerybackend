import express from "express";
import {
  createSale,
  getAllSales,
  getSaleById,
} from "../controllers/sale.controller.js";
import { returnSaleItem } from "../controllers/saleReturn.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorize("OWNER", "STAFF"), createSale);
router.get("/", authorize("OWNER"), getAllSales);
router.get("/:id", authorize("OWNER"), getSaleById);
router.post("/:saleId/return", authorize("OWNER", "STAFF"), returnSaleItem);

export default router;
