import pool from '../config/db.js';
import { generateId } from '../utils/idGenerator.js';
import { errorResponse } from '../utils/errorResponse.js';

export const createOrder = async (req, res) => {
  const { amount, currency = "INR", receipt, notes } = req.body;

  if (!Number.isInteger(amount) || amount < 100) {
    return errorResponse(res, 400, "BAD_REQUEST_ERROR", "amount must be at least 100");
  }

  let orderId;
  while (true) {
    orderId = generateId("order");
    const exists = await pool.query(`SELECT 1 FROM orders WHERE id=$1`, [orderId]);
    if (exists.rowCount === 0) break;
  }

  const result = await pool.query(
    `INSERT INTO orders (id, merchant_id, amount, currency, receipt, notes)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [orderId, req.merchant.id, amount, currency, receipt, notes || {}]
  );

  const o = result.rows[0];

  return res.status(201).json({
    id: o.id,
    merchant_id: o.merchant_id,
    amount: o.amount,
    currency: o.currency,
    receipt: o.receipt,
    notes: o.notes,
    status: o.status,
    created_at: o.created_at
  });
};

export const getOrder = async (req, res) => {
  const { order_id } = req.params;

  const result = await pool.query(
    `SELECT * FROM orders WHERE id=$1 AND merchant_id=$2`,
    [order_id, req.merchant.id]
  );

  if (result.rowCount === 0) {
    return errorResponse(res, 404, "NOT_FOUND_ERROR", "Order not found");
  }

  return res.status(200).json(result.rows[0]);
};
