import express from 'express';
import { authenticateMerchant } from '../middlewares/auth.middleware.js';
import { createPayment, getPayment } from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/payments', authenticateMerchant, createPayment);
router.get('/payments/:payment_id', authenticateMerchant, getPayment);

export default router;
