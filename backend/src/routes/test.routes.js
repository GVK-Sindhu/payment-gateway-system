import express from 'express';
import { jobStatus } from '../controllers/test.controller.js';

const router = express.Router();

/**
 * REQUIRED TEST ENDPOINT
 * No authentication
 */
router.get('/test/jobs/status', jobStatus);

export default router;
