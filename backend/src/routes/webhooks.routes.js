import express from 'express';
import { authenticateMerchant } from '../middlewares/auth.middleware.js';
import {
  listWebhooks,
  retryWebhook
} from '../controllers/webhooks.controller.js';

const router = express.Router();

router.get('/api/v1/webhooks', authenticateMerchant, listWebhooks);
router.post(
  '/api/v1/webhooks/:webhook_id/retry',
  authenticateMerchant,
  retryWebhook
);

export default router;
