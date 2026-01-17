import { Queue } from 'bullmq';
import redis from '../config/redis.js';

const webhookQueue = new Queue('webhooks', {
  connection: redis
});

export default webhookQueue;
