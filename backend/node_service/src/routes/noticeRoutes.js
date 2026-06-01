import express from 'express';
import { sendLegalNotice, getLegalNoticesCount } from '../controllers/noticeController.js';

const router = express.Router();

// POST /api/send-legal-notice
router.post('/', sendLegalNotice);

// GET /api/notices/count
router.get('/count', getLegalNoticesCount);

export default router;

