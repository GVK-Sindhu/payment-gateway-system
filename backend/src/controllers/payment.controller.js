import pool from '../config/db.js';
import { generateId } from '../utils/idGenerator.js';
import { errorResponse } from '../utils/errorResponse.js';
import { isValidVPA } from '../utils/vpa.js';
import { isValidCardNumber } from '../utils/luhn.js';
import { detectCardNetwork } from '../utils/cardNetwork.js';
import { isValidExpiry } from '../utils/expiry.js';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const createPayment = async (req, res) => {
  const { order_id, method, vpa, card } = req.body;

  const orderRes = await pool.query(
    `SELECT * FROM orders WHERE id=$1 AND merchant_id=$2`,
    [order_id, req.merchant.id]
  );

  if (orderRes.rowCount === 0) {
    return errorResponse(res, 404, "NOT_FOUND_ERROR", "Order not found");
  }

  const order = orderRes.rows[0];

  let paymentId;
  while (true) {
    paymentId = generateId("pay");
    const exists = await pool.query(`SELECT 1 FROM payments WHERE id=$1`, [paymentId]);
    if (exists.rowCount === 0) break;
  }

  let cardNetwork = null;
  let cardLast4 = null;

  if (method === "upi") {
    if (!isValidVPA(vpa)) {
      return errorResponse(res, 400, "INVALID_VPA", "VPA format invalid");
    }
  }

  if (method === "card") {
    if (!card || !isValidCardNumber(card.number)) {
      return errorResponse(res, 400, "INVALID_CARD", "Card validation failed");
    }
    if (!isValidExpiry(card.expiry_month, card.expiry_year)) {
      return errorResponse(res, 400, "EXPIRED_CARD", "Card expiry date invalid");
    }
    cardNetwork = detectCardNetwork(card.number);
    cardLast4 = card.number.slice(-4);
  }

  const insert = await pool.query(
    `INSERT INTO payments
     (id, order_id, merchant_id, amount, currency, method, status, vpa, card_network, card_last4)
     VALUES ($1,$2,$3,$4,$5,$6,'processing',$7,$8,$9)
     RETURNING *`,
    [
      paymentId,
      order.id,
      req.merchant.id,
      order.amount,
      order.currency,
      method,
      vpa || null,
      cardNetwork,
      cardLast4
    ]
  );

  const payment = insert.rows[0];

  const testMode = process.env.TEST_MODE === "true";
  const success =
    testMode
      ? process.env.TEST_PAYMENT_SUCCESS !== "false"
      : Math.random() < (method === "upi" ? 0.9 : 0.95);

  const waitTime = testMode
    ? parseInt(process.env.TEST_PROCESSING_DELAY || "1000")
    : Math.floor(Math.random() * 5000) + 5000;

  await delay(waitTime);

  if (success) {
    await pool.query(`UPDATE payments SET status='success' WHERE id=$1`, [payment.id]);
  } else {
    await pool.query(
      `UPDATE payments SET status='failed', error_code='PAYMENT_FAILED',
       error_description='Payment processing failed' WHERE id=$1`,
      [payment.id]
    );
  }

  return res.status(201).json({
    id: payment.id,
    order_id: payment.order_id,
    amount: payment.amount,
    currency: payment.currency,
    method: payment.method,
    status: success ? "success" : "failed",
    ...(method === "upi" && { vpa }),
    ...(method === "card" && { card_network: cardNetwork, card_last4: cardLast4 }),
    created_at: payment.created_at
  });
};

export const getPayment = async (req, res) => {
  const { payment_id } = req.params;

  const result = await pool.query(
    `SELECT * FROM payments WHERE id=$1 AND merchant_id=$2`,
    [payment_id, req.merchant.id]
  );

  if (result.rowCount === 0) {
    return errorResponse(res, 404, "NOT_FOUND_ERROR", "Payment not found");
  }

  const p = result.rows[0];

  return res.status(200).json({
    id: p.id,
    order_id: p.order_id,
    amount: p.amount,
    currency: p.currency,
    method: p.method,
    status: p.status,
    ...(p.method === "upi" && { vpa: p.vpa }),
    ...(p.method === "card" && {
      card_network: p.card_network,
      card_last4: p.card_last4
    }),
    created_at: p.created_at,
    updated_at: p.updated_at
  });
};
