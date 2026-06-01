import express from 'express';
import { updateProfile, changePassword, enable2FA, disable2FA, deleteAccount } from '../controllers/userController.js';

const router = express.Router();

router.patch('/me', updateProfile);
router.post('/change-password', changePassword);
router.post('/2fa', enable2FA);
router.delete('/2fa', disable2FA);
router.delete('/me', deleteAccount);

export default router;
