const { Queue } = require('bullmq');
const redis = require('../config/redis');

const paymentQueue = new Queue('payments', { connection: redis });
const webhookQueue = new Queue('webhooks', { connection: redis });
const refundQueue = new Queue('refunds', { connection: redis });

module.exports = {
  paymentQueue,
  webhookQueue,
  refundQueue
};
