import pool from '../config/db.js';
import { generateId } from '../utils/idGenerator.js';
import { errorResponse } from '../utils/errorResponse.js';
import { isValidVPA } from '../utils/vpa.js';
import { isValidCardNumber } from '../utils/luhn.js';
import { detectCardNetwork } from '../utils/cardNetwork.js';
import { isValidExpiry } from '../utils/expiry.js';

import paymentQueue from '../queues/payment.queue.js';
import {
  getCachedResponse,
  saveResponse
} from '../services/idempotency.service.js';

/* ===========================
   CREATE PAYMENT
=========================== */
export const createPayment = async (req, res) => {
  try {
    const { order_id, method, vpa, card } = req.body;
    const merchantId = req.merchant.id;
    const idempotencyKey = req.header('Idempotency-Key');

    /* 1️⃣ Idempotency */
    if (idempotencyKey) {
      const cached = await getCachedResponse(merchantId, idempotencyKey);
      if (cached) {
        return res.status(201).json(cached);
      }
    }

    /* 2️⃣ Validate order */
    const orderRes = await pool.query(
      `SELECT * FROM orders WHERE id=$1 AND merchant_id=$2`,
      [order_id, merchantId]
    );

    if (!orderRes.rows.length) {
      return errorResponse(res, 404, 'NOT_FOUND_ERROR', 'Order not found');
    }

    const order = orderRes.rows[0];

    /* 3️⃣ Generate unique payment ID */
    let paymentId;
    while (true) {
      paymentId = generateId('pay');
      const exists = await pool.query(
        `SELECT 1 FROM payments WHERE id=$1`,
        [paymentId]
      );
      if (!exists.rowCount) break;
    }

    /* 4️⃣ Validate method */
    let cardNetwork = null;
    let cardLast4 = null;

    if (method === 'upi') {
      if (!isValidVPA(vpa)) {
        return errorResponse(res, 400, 'INVALID_VPA', 'Invalid VPA');
      }
    }

    if (method === 'card') {
      if (!card || !isValidCardNumber(card.number)) {
        return errorResponse(res, 400, 'INVALID_CARD', 'Invalid card');
      }
      if (!isValidExpiry(card.expiry_month, card.expiry_year)) {
        return errorResponse(res, 400, 'EXPIRED_CARD', 'Card expired');
      }
      cardNetwork = detectCardNetwork(card.number);
      cardLast4 = card.number.slice(-4);
    }

    /* 5️⃣ Insert payment (PENDING) */
    const insert = await pool.query(
      `INSERT INTO payments
       (id, order_id, merchant_id, amount, currency, method, status,
        vpa, card_network, card_last4)
       VALUES ($1,$2,$3,$4,$5,$6,'pending',$7,$8,$9)
       RETURNING *`,
      [
        paymentId,
        order.id,
        merchantId,
        order.amount,
        order.currency,
        method,
        vpa || null,
        cardNetwork,
        cardLast4
      ]
    );

    const payment = insert.rows[0];

    /* 6️⃣ Enqueue async job */
    await paymentQueue.add('process-payment', {
      paymentId: payment.id
    });

    const response = {
      id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      created_at: payment.created_at
    };

    /* 7️⃣ Save idempotency */
    if (idempotencyKey) {
      await saveResponse(merchantId, idempotencyKey, response);
    }

    return res.status(201).json(response);
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'SERVER_ERROR', 'Payment failed');
  }
};

/* ===========================
   GET PAYMENT
=========================== */
export const getPayment = async (req, res) => {
  const { payment_id } = req.params;

  const result = await pool.query(
    `SELECT * FROM payments WHERE id=$1 AND merchant_id=$2`,
    [payment_id, req.merchant.id]
  );

  if (!result.rows.length) {
    return errorResponse(res, 404, 'NOT_FOUND_ERROR', 'Payment not found');
  }

  res.json(result.rows[0]);
};

/* ===========================
   CAPTURE PAYMENT
=========================== */
export const capturePayment = async (req, res) => {
  const { id } = req.params;
  const merchantId = req.merchant.id;

  const result = await pool.query(
    `SELECT * FROM payments WHERE id=$1 AND merchant_id=$2`,
    [id, merchantId]
  );

  if (!result.rows.length || result.rows[0].status !== 'success') {
    return errorResponse(
      res,
      400,
      'BAD_REQUEST_ERROR',
      'Payment not in capturable state'
    );
  }

  const updated = await pool.query(
    `UPDATE payments
     SET captured=true, updated_at=NOW()
     WHERE id=$1
     RETURNING *`,
    [id]
  );

  res.json(updated.rows[0]);
};
