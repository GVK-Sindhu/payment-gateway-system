import pool from '../config/db.js';
import refundQueue from '../queues/refund.queue.js';
import { errorResponse } from '../utils/errorResponse.js';
import { generateRefundId } from '../utils/idGenerator.js';

export async function createRefund(req, res) {
  try {
    const { amount, reason } = req.body;
    const { payment_id: paymentId } = req.params;
    const merchantId = req.merchant.id;

    /* 1️⃣ Validate payment */
    const paymentRes = await pool.query(
      `SELECT * FROM payments
       WHERE id = $1 AND merchant_id = $2 AND status = 'success'`,
      [paymentId, merchantId]
    );

    if (!paymentRes.rows.length) {
      return errorResponse(
        res,
        404,
        'PAYMENT_NOT_FOUND',
        'Payment not found or not refundable'
      );
    }

    /* 2️⃣ Generate refund ID (FIX) */
    const refundId = generateRefundId();

    /* 3️⃣ Insert refund WITH ID */
    const refundRes = await pool.query(
      `INSERT INTO refunds
       (id, payment_id, merchant_id, amount, reason, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
       RETURNING *`,
      [
        refundId,
        paymentId,
        merchantId,
        amount,
        reason || null
      ]
    );

    const refund = refundRes.rows[0];

    /* 4️⃣ Enqueue refund worker */
    await refundQueue.add('process', {
      refundId: refund.id
    });

    return res.status(201).json(refund);

  } catch (err) {
    console.error('Create refund error:', err);
    return errorResponse(
      res,
      500,
      'SERVER_ERROR',
      'Refund creation failed'
    );
  }
}

export async function getRefund(req, res) {
  try {
    const { refund_id } = req.params;
    const merchantId = req.merchant.id;

    const result = await pool.query(
      `SELECT *
       FROM refunds
       WHERE id = $1 AND merchant_id = $2`,
      [refund_id, merchantId]
    );

    if (!result.rows.length) {
      return errorResponse(
        res,
        404,
        'NOT_FOUND_ERROR',
        'Refund not found'
      );
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Get refund error:', err);
    return errorResponse(
      res,
      500,
      'SERVER_ERROR',
      'Failed to fetch refund'
    );
  }
}
