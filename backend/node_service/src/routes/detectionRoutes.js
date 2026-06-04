import express from 'express';
import { runDetectionScan, getDetections, updateDetectionStatus, deleteDetection } from '../controllers/detectionController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route to trigger a deep image detection scan
router.post('/scan', protect, runDetectionScan);

// Route to fetch detections for the user
router.get('/', protect, getDetections);

// Route to update detection client status
router.put('/:id', protect, updateDetectionStatus);

// Route to delete a detection match
router.delete('/:id', protect, deleteDetection);

export default router;
