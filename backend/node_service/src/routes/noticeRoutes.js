import express from 'express';
import { 
    sendLegalNotice, 
    getLegalNoticesCount,
    getLegalNotices,
    updateNoticeStatus,
    resendLegalNotice,
    deleteNotice
} from '../controllers/noticeController.js';

const router = express.Router();

// POST /api/notices
router.post('/', sendLegalNotice);

// GET /api/notices/count
router.get('/count', getLegalNoticesCount);

// GET /api/notices
router.get('/', getLegalNotices);

// PUT /api/notices/:id
router.put('/:id', updateNoticeStatus);

// POST /api/notices/:id/resend
router.post('/:id/resend', resendLegalNotice);

// DELETE /api/notices/:id
router.delete('/:id', deleteNotice);

export default router;


