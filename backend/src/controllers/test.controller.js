import pool from '../config/db.js';
import paymentQueue from '../queues/payment.queue.js';
import refundQueue from '../queues/refund.queue.js';

export const getTestMerchant = async (req, res) => {
  const result = await pool.query(
    `SELECT id, email, api_key FROM merchants WHERE email='test@example.com'`
  );

  if (result.rowCount === 0) {
    return res.status(404).json({});
  }

  return res.status(200).json({
    ...result.rows[0],
    seeded: true
  });
};



export async function jobStatus(req, res) {
  const paymentCounts = await paymentQueue.getJobCounts();
  const refundCounts = await refundQueue.getJobCounts();

  res.json({
    pending: paymentCounts.waiting + refundCounts.waiting,
    processing: paymentCounts.active + refundCounts.active,
    completed: paymentCounts.completed + refundCounts.completed,
    failed: paymentCounts.failed + refundCounts.failed,
    worker_status: 'running'
  });
}
