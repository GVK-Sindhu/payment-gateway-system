import express from 'express';
import { Queue } from 'bullmq';
import redis from '../config/redis.js';

const router = express.Router();

const paymentQueue = new Queue('payments', { connection: redis });
const refundQueue = new Queue('refunds', { connection: redis });
const webhookQueue = new Queue('webhooks', { connection: redis });

router.get('/status', async (req, res) => {
  const queues = [paymentQueue, refundQueue, webhookQueue];

  let waiting = 0;
  let active = 0;
  let completed = 0;
  let failed = 0;

  for (const q of queues) {
    const counts = await q.getJobCounts(
      'waiting',
      'active',
      'completed',
      'failed'
    );
    waiting += counts.waiting;
    active += counts.active;
    completed += counts.completed;
    failed += counts.failed;
  }

  res.json({ waiting, active, completed, failed });
});

export default router;
