import { Worker } from 'bullmq';
import redis from '../config/redis.js';
import pool from '../config/db.js';
import webhookQueue from '../queues/webhook.queue.js';
import processRefund from '../jobs/processRefund.job.js';

new Worker(
  'refunds',
  async job => {
    await processRefund({
      refundId: job.data.refundId,
      db: pool,
      webhookQueue
    });
  },
  { connection: redis }
);

console.log('Refund worker running');
