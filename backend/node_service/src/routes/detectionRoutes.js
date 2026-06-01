import express from 'express';
import { runDetectionScan, getDetections } from '../controllers/detectionController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route to trigger a deep image detection scan
router.post('/scan', protect, runDetectionScan);

// Route to fetch detections for the user
router.get('/', protect, getDetections);

export default router;
