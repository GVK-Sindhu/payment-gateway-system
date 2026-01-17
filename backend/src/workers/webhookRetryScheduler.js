import db from '../config/db.js';
import webhookQueue from '../queues/webhook.queue.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runScheduler() {
  try {
    const { rows } = await db.query(
      `SELECT id FROM webhook_logs
      WHERE status='pending'
      AND attempts < 5
      AND (next_retry_at IS NULL OR next_retry_at <= NOW())`
    );


    for (const row of rows) {
      await webhookQueue.add('deliver-webhook', {
        webhookLogId: row.id
      });
    }
  } catch (err) {
       if (err.code === '42P01') {
      console.log('Webhook logs table not ready yet, retrying...');
      return;
    }
    console.error('Webhook retry scheduler error:', err);
  }
}

(async () => {
  await sleep(5000);
  setInterval(runScheduler, 5000);
  console.log('Webhook retry scheduler running');
})();
