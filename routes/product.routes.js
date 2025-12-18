// ==========================
// src/routes/product.routes.js (SECURED)
// ==========================
import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} from "../controllers/product.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorize("OWNER"), createProduct);
router.get("/", getAllProducts);
router.get("/low-stock", getLowStockProducts);
router.get("/:id", getProductById);
router.put("/:id", authorize("OWNER"), updateProduct);
router.delete("/:id", authorize("OWNER"), deleteProduct);

export default router;
