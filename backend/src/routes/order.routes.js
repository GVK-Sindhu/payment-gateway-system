import express from 'express';
import { authenticateMerchant } from '../middlewares/auth.middleware.js';
import { createOrder, getOrder } from '../controllers/order.controller.js';

const router = express.Router();

router.post('/orders', authenticateMerchant, createOrder);
router.get('/orders/:order_id', authenticateMerchant, getOrder);

export default router;
