import express from 'express';
import multer from 'multer';
import { handleImageUpload } from '../controllers/uploadController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Configure multer to store files in memory so we can pass the buffer to Python
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', protect, upload.single('image'), handleImageUpload);

export default router;
