import { User, Brand } from '../models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { generateAndSendOtp, verifyOtpCode } from '../services/otpService.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, brandName, websiteUrl } = req.body;

        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
            return res.status(400).json({ status: 'fail', message: 'User already exists' });
        }

        // Split name into first/last
        const nameParts = (name || '').split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';

        const user = await User.create({
            first_name: firstName,
            last_name: lastName,
            email,
            password_hash: password, // The model hook handles hashing
            role: 'client'
        });

        // Create Brand automatically with a fallback name
        const finalBrandName = brandName || `${firstName}'s Brand`;
        await Brand.create({
            owner_id: user.id,
            name: finalBrandName,
            website_url: websiteUrl || ''
        });

        if (user) {
            res.status(201).json({
                status: 'success',
                user: {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    name: `${user.first_name} ${user.last_name}`.trim(),
                    email: user.email,
                    role: user.role,
                },
                token: generateToken(user.id),
            });
        }
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        const user = await User.findOne({ where: { email } });

        if (user && (await user.matchPassword(password))) {
            // Update remember_me preference
            user.remember_me = !!rememberMe;
            await user.save();

            // Check if Two-Factor Authentication is enabled
            if (user.two_factor_enabled) {
                // Generate and send secure OTP using reusable service
                const otpRes = await generateAndSendOtp(user.email, '2fa');
                if (!otpRes.success) {
                    return res.status(500).json({ status: 'error', message: otpRes.message });
                }

                // Return 2FA required status to frontend
                return res.json({
                    status: '2fa_required',
                    message: 'Two-factor authentication code sent to email',
                    email: user.email
                });
            }

            // Standard direct login if 2FA is disabled
            res.json({
                status: 'success',
                user: {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    name: `${user.first_name} ${user.last_name}`.trim(),
                    email: user.email,
                    role: user.role,
                },
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ status: 'fail', message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] },
            include: [{ model: Brand, as: 'brands' }]
        });
        const userData = user.toJSON();
        userData.name = `${user.first_name} ${user.last_name}`.trim();
        res.json({ status: 'success', user: userData });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ status: 'fail', message: 'Please provide email and OTP code' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        if (!user.two_factor_enabled) {
            return res.status(400).json({ status: 'fail', message: 'Two-factor authentication is not enabled for this user' });
        }

        // Verify OTP using our reusable verifyOtpCode helper for purpose '2fa'
        const verifyRes = await verifyOtpCode(email, '2fa', otp);
        if (!verifyRes.success) {
            return res.status(400).json({ status: 'fail', message: verifyRes.message });
        }

        // Retrieve brand for user object
        const brand = await Brand.findOne({ where: { owner_id: user.id } });

        res.json({
            status: 'success',
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                name: `${user.first_name} ${user.last_name}`.trim(),
                email: user.email,
                role: user.role,
                brands: brand ? [brand] : []
            },
            token: generateToken(user.id)
        });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ status: 'fail', message: 'Please provide registered email address' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        if (!user.two_factor_enabled) {
            return res.status(400).json({ status: 'fail', message: 'Two-factor authentication is not enabled for this user' });
        }

        // Generate and send secure OTP using reusable service for purpose '2fa'
        const otpRes = await generateAndSendOtp(email, '2fa');
        if (!otpRes.success) {
            return res.status(500).json({ status: 'error', message: otpRes.message });
        }

        res.json({
            status: 'success',
            message: 'A new 6-digit OTP passcode has been sent to your email.'
        });
    } catch (error) {
        console.error('Resend OTP Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ status: 'fail', message: 'Please provide your email address' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            // Return success to prevent email enumeration, but log it internally
            console.log(`Password reset requested for non-existent email: ${email}`);
            return res.json({
                status: 'success',
                message: 'If a matching account exists, a 6-digit OTP code has been sent to your email.'
            });
        }

        // Generate and send secure OTP using reusable service for password reset
        const otpRes = await generateAndSendOtp(email, 'reset_password');
        if (!otpRes.success) {
            return res.status(500).json({ status: 'error', message: otpRes.message });
        }

        res.json({
            status: 'success',
            message: 'A 6-digit verification OTP code has been sent to your email.'
        });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({ status: 'fail', message: 'Please provide email, OTP, and new password' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        // Verify OTP using our reusable verifyOtpCode helper for purpose 'reset_password'
        const verifyRes = await verifyOtpCode(email, 'reset_password', otp);
        if (!verifyRes.success) {
            return res.status(400).json({ status: 'fail', message: verifyRes.message });
        }

        // OTP is correct! Update password
        user.password_hash = password; // The model hook handles hashing
        await user.save();

        res.json({
            status: 'success',
            message: 'Your password has been successfully reset! You can now log in.'
        });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const sendOtp = async (req, res) => {
    try {
        const { email, purpose } = req.body;

        if (!email || !purpose) {
            return res.status(400).json({ status: 'fail', message: 'Please provide email and purpose' });
        }

        const otpRes = await generateAndSendOtp(email, purpose);
        if (!otpRes.success) {
            return res.status(500).json({ status: 'error', message: otpRes.message });
        }

        res.json({
            status: 'success',
            message: otpRes.message
        });
    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};


