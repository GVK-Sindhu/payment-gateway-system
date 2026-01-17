import { Worker } from 'bullmq';
import redis from '../config/redis.js';
import deliverWebhook from '../jobs/deliverWebhook.job.js';

new Worker(
  'webhooks',
  async job => {
    if (job.name === 'deliver-webhook') {
      await deliverWebhook({
        webhookLogId: job.data.webhookLogId
      });
    }
  },
  {
    connection: redis
  }
);

console.log('Webhook worker running');
