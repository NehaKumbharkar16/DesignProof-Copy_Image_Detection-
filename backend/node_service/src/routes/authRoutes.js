import express from 'express';
import { registerUser, loginUser, getMe, verifyOTP, resendOTP, forgotPassword, resetPassword, sendOtp } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/send-otp', sendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
    (req, res) => {
        const token = generateToken(req.user.id);
        res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
    }
);

// GitHub OAuth Routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', 
    passport.authenticate('github', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
    (req, res) => {
        const token = generateToken(req.user.id);
        res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
    }
);

export default router;
