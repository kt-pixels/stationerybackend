import express from "express";
import { getCreditors, payCredit } from "../controllers/creditor.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", authorize("OWNER"), getCreditors);
router.post("/:id/pay", authorize("OWNER"), payCredit);

export default router;
