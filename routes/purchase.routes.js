// ==========================
// src/routes/purchase.routes.js (SECURED)
// ==========================
import express from "express";
import {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
} from "../controllers/purchase.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorize("OWNER"), createPurchase);
router.get("/", authorize("OWNER"), getAllPurchases);
router.get("/:id", authorize("OWNER"), getPurchaseById);

export default router;
