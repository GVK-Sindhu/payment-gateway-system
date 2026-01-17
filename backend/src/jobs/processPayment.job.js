import pool from '../config/db.js';
import webhookQueue from '../queues/webhook.queue.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));

export default async function processPayment({ paymentId }) {
  const { rows } = await pool.query(
    'SELECT * FROM payments WHERE id = $1',
    [paymentId]
  );

  if (!rows.length) return;

  const payment = rows[0];

  if (payment.status !== 'pending') return;

  await sleep(2000);

  await pool.query(
    `UPDATE payments
     SET status = 'success'
     WHERE id = $1`,
    [paymentId]
  );

  await webhookQueue.add('deliver', {
    webhookLogId: await createWebhookLog(
      pool,
      payment.merchant_id,
      'payment.success',
      {
        event: 'payment.success',
        timestamp: Math.floor(Date.now() / 1000),
        data: { payment }
      }
    )
  });
}

async function createWebhookLog(db, merchantId, event, payload) {
  const { rows } = await db.query(
    `INSERT INTO webhook_logs
     (merchant_id, event, payload, status, attempts)
     VALUES ($1, $2, $3, 'pending', 0)
     RETURNING id`,
    [merchantId, event, payload]
  );
  return rows[0].id;
}
