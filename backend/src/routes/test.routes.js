import express from 'express';
import { getTestMerchant } from '../controllers/test.controller.js';

const router = express.Router();

router.get('/api/v1/test/merchant', getTestMerchant);

export default router;
