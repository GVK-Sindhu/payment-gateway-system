import { Queue } from 'bullmq';
import redis from '../config/redis.js';

const paymentQueue = new Queue('payments', {
  connection: redis
});

export default paymentQueue;


