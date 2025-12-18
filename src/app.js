// ==========================
// src/app.js (FINAL SECURED APP)
// ==========================
import express from "express";
import cors from "cors";

import authRoutes from "../routes/auth.routes.js";
import productRoutes from "../routes/product.routes.js";
import purchaseRoutes from "../routes/purchase.routes.js";
import saleRoutes from "../routes/sale.routes.js";
import expenseRoutes from "../routes/expense.routes.js";
import dashboardRoutes from "../routes/dashboard.routes.js";
import creditorRoutes from "./src/routes/creditor.routes.js";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/creditors", creditorRoutes);

export default app;
