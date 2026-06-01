import express from 'express';
import {
    createOrder,
    verifyPayment,
    currentSubscription,
    transactionsHistory,
    cancelSubscription
} from '../controllers/subscriptionController.js';

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/current', currentSubscription);
router.get('/transactions', transactionsHistory);
router.post('/cancel', cancelSubscription);

export default router;
