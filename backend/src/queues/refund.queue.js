import { Queue } from 'bullmq';
import redis from '../config/redis.js';

const refundQueue = new Queue('refunds', {
  connection: redis
});

export default refundQueue;
