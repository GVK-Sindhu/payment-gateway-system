import express from 'express';
import { authenticateMerchant } from '../middlewares/auth.middleware.js';

import {
  createPayment,
  getPayment,
  capturePayment
} from '../controllers/payment.controller.js';

import {
  createRefund,
  getRefund
} from '../controllers/refundController.js';

const router = express.Router();

/* Payments */
router.post('/payments', authenticateMerchant, createPayment);
router.get('/payments/:payment_id', authenticateMerchant, getPayment);
router.post('/payments/:id/capture', authenticateMerchant, capturePayment);

/* Refunds */
router.post(
  '/payments/:payment_id/refunds',
  authenticateMerchant,
  createRefund
);

router.get(
  '/refunds/:refund_id',
  authenticateMerchant,
  getRefund
);

export default router;
