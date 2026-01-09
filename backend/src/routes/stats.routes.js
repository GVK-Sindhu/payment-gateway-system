import express from "express";
import pool from "../db/pool.js";
import { authenticateMerchant } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * GET /api/v1/stats
 */
router.get("/stats", authenticateMerchant, async (req, res) => {
  const totalTxRes = await pool.query(
    "SELECT COUNT(*) FROM payments"
  );

  const successTxRes = await pool.query(
    "SELECT COUNT(*) FROM payments WHERE status = 'success'"
  );

  const amountRes = await pool.query(
    "SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'success'"
  );

  const totalTransactions = Number(totalTxRes.rows[0].count);
  const successfulTransactions = Number(successTxRes.rows[0].count);
  const totalAmount = Number(amountRes.rows[0].coalesce);

  const successRate =
    totalTransactions === 0
      ? 0
      : Math.round((successfulTransactions / totalTransactions) * 100);

  res.json({
    totalTransactions,
    totalAmount,
    successRate
  });
});

export default router;
