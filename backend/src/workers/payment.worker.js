import { Worker } from 'bullmq';
import redis from '../config/redis.js';
import pool from '../config/db.js';
import processPayment from '../jobs/processPayment.job.js';

new Worker(
  'payments',
  async job => {
    await processPayment({
      paymentId: job.data.paymentId,
      db: pool
    });
  },
  {
    connection: redis
  }
);

console.log(' Payment worker running');
