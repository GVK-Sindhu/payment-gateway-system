import webhookQueue from '../queues/webhook.queue.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));

export default async ({ refundId, db, webhookQueue }) => {
  const { rows } = await db.query(
    'SELECT * FROM refunds WHERE id = $1',
    [refundId]
  );
  if (!rows.length) return;

  const refund = rows[0];

  const paymentRes = await db.query(
    'SELECT * FROM payments WHERE id = $1',
    [refund.payment_id]
  );
  if (!paymentRes.rows.length) return;

  const payment = paymentRes.rows[0];

  if (payment.status !== 'success') {
    throw new Error('Payment not refundable');
  }

  const totalRefundRes = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM refunds
     WHERE payment_id=$1
       AND status IN ('pending','processed')`,
    [payment.id]
  );

  if (Number(totalRefundRes.rows[0].total) > payment.amount) {
    throw new Error('Refund exceeds payment amount');
  }

  /*  Test-mode safe delay */
  const testMode = process.env.TEST_MODE === 'true';
  const delay = testMode
    ? Number(process.env.TEST_REFUND_DELAY || 1000)
    : 3000 + Math.random() * 2000;

  await sleep(delay);

  await db.query(
    `UPDATE refunds
     SET status='processed',
         processed_at=NOW()
     WHERE id=$1`,
    [refundId]
  );

  await webhookQueue.add('deliver', {
    webhookLogId: await createWebhookLog(
      db,
      refund.merchant_id,
      'refund.processed',
      {
        event: 'refund.processed',
        timestamp: Math.floor(Date.now() / 1000),
        data: { refund }
      }
    )
  });
};

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
