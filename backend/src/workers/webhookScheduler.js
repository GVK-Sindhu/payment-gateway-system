import { Queue } from 'bullmq';
import redis from '../config/redis.js';
import pool from '../config/db.js';

const webhookQueue = new Queue('webhooks', { connection: redis });

const POLL_INTERVAL = 5000; // 5 seconds

setInterval(async () => {
  try {
    const { rows } = await pool.query(`
      SELECT id
      FROM webhook_logs
      WHERE status IN ('pending', 'failed')
        AND attempts < 5
        AND (next_retry_at IS NULL OR next_retry_at <= NOW())
      ORDER BY created_at ASC
      LIMIT 10
    `);

    for (const row of rows) {
      await webhookQueue.add(
        'deliver-webhook',
        { webhookLogId: row.id },
        { removeOnComplete: true, removeOnFail: true }
      );
    }
  } catch (err) {
    console.error('Webhook scheduler error:', err.message);
  }
}, POLL_INTERVAL);

console.log('Webhook retry scheduler running');
