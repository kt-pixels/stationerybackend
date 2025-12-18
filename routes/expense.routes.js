// ==========================
// src/routes/expense.routes.js (SECURED)
// ==========================
import express from "express";
import {
  createExpense,
  getAllExpenses,
  deleteExpense,
} from "../controllers/expense.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorize("OWNER"), createExpense);
router.get("/", authorize("OWNER"), getAllExpenses);
router.delete("/:id", authorize("OWNER"), deleteExpense);

export default router;
