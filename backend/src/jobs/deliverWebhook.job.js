import crypto from 'crypto';
import pool from '../config/db.js';

export default async function deliverWebhook({ webhookLogId }) {
  const { rows } = await pool.query(
    `SELECT wl.*, m.webhook_url, m.webhook_secret
     FROM webhook_logs wl
     JOIN merchants m ON m.id = wl.merchant_id
     WHERE wl.id = $1`,
    [webhookLogId]
  );

  if (!rows.length) return;

  const log = rows[0];

  // atomic increment
  await pool.query(
    `UPDATE webhook_logs
     SET attempts = attempts + 1,
         last_attempt_at = NOW()
     WHERE id = $1`,
    [webhookLogId]
  );

  const attempt = log.attempts + 1;

  const payload = JSON.stringify(log.payload);

  const signature = crypto
    .createHmac('sha256', log.webhook_secret)
    .update(payload)
    .digest('hex');

  try {
    const res = await fetch(log.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature
      },
      body: payload
    });

    if (res.status >= 200 && res.status < 300) {
      await pool.query(
        `UPDATE webhook_logs
         SET status = 'success',
             response_code = $1
         WHERE id = $2`,
        [res.status, webhookLogId]
      );
    } else {
      throw new Error(`Webhook failed with ${res.status}`);
    }
  } catch (err) {
    if (attempt >= 5) {
      await pool.query(
        `UPDATE webhook_logs
         SET status = 'failed'
         WHERE id = $1`,
        [webhookLogId]
      );
      return;
    }

    await pool.query(
      `UPDATE webhook_logs
       SET next_retry_at = NOW() + INTERVAL '30 seconds'
       WHERE id = $1`,
      [webhookLogId]
    );
  }
}
