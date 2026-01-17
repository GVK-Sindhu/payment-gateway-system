import express from 'express';
import { authenticateMerchant } from '../middlewares/auth.middleware.js';
import { getRefund, createRefund } from '../controllers/refundController.js';


const router = express.Router();

router.post(
  '/payments/:payment_id/refunds',
  authenticateMerchant,
  createRefund
);

export default router;
