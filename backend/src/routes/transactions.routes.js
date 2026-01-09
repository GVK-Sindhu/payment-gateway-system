import express from "express";
import pool from "../db/pool.js";
import { authenticateMerchant } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/transactions", authenticateMerchant, async (req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM payments ORDER BY created_at DESC"
  );
  res.json(rows);
});

export default router;
