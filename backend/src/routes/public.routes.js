import express from "express";
import pool from "../db/pool.js";
import { createPaymentInternal } from "../services/payment.service.js";

const router = express.Router();

/**
 * GET PUBLIC ORDER
 * GET /api/v1/orders/:order_id/public
 */
router.get("/orders/:order_id/public", async (req, res) => {
  try {
    const { order_id } = req.params;

    const result = await pool.query(
      "SELECT id, amount, currency, status FROM orders WHERE id = $1",
      [order_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: { code: "NOT_FOUND_ERROR", description: "Order not found" }
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST PUBLIC PAYMENT
 * POST /api/v1/payments/public
 */
router.post("/payments/public", async (req, res) => {
  try {
    const { order_id, method, vpa, card } = req.body;

    const orderRes = await pool.query(
      "SELECT * FROM orders WHERE id = $1",
      [order_id]
    );

    if (orderRes.rowCount === 0) {
      return res.status(404).json({
        error: { code: "NOT_FOUND_ERROR", description: "Order not found" }
      });
    }
    const payment = await createPaymentInternal({
      order_id,
      method,
      vpa,
      card
    });
    res.status(201).json(payment);
  } catch (e) {
    res.status(400).json({
      error: { code: "PAYMENT_FAILED", description: e.message }
    });
  }
});

export default router;
