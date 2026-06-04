import express from 'express';
import { getProducts, deleteProduct } from '../controllers/productController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getProducts);
router.delete('/:id', protect, deleteProduct);

export default router;
