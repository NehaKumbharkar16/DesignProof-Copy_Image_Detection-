import bcrypt from 'bcryptjs';
import { OtpCode, User } from '../models/index.js';
import { sendGenericOtpEmail } from './mailService.js';

/**
 * Generate a 6-digit secure OTP, hash it, store with a 5-minute expiry in database,
 * and dispatch it via SMTP email.
 * @param {string} email - The user's email address
 * @param {string} purpose - The OTP purpose e.g., '2fa', 'reset_password', 'email_verification'
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const generateAndSendOtp = async (email, purpose) => {
    try {
        if (!email || !purpose) {
            throw new Error('Email and purpose are required to generate an OTP');
        }

        // Generate 6-digit OTP passcode
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Hash OTP before saving
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);

        // Set expiry (5 minutes)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Delete any existing active OTP codes for this email and purpose
        await OtpCode.destroy({
            where: { email, purpose }
        });

        // Store new OTP in database
        await OtpCode.create({
            email,
            otp_hash: hashedOtp,
            purpose,
            expires_at: expiresAt,
            attempts: 0,
            is_verified: false
        });

        // Find user name for personalized email
        const user = await User.findOne({ where: { email } });
        const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'User';

        // Dispatch Email
        const emailRes = await sendGenericOtpEmail({
            to: email,
            otp,
            purpose,
            userName
        });

        if (!emailRes.success) {
            throw new Error(emailRes.error || 'Failed to dispatch email');
        }

        return {
            success: true,
            message: `A secure 6-digit passcode has been sent to ${email}.`
        };
    } catch (error) {
        console.error('Error generating/sending OTP:', error);
        return {
            success: false,
            message: error.message || 'Error occurred while generating OTP'
        };
    }
};

/**
 * Verify a user-provided OTP code against the stored database hash.
 * Enforces 5-minute expiry and maximum 3 attempts.
 * @param {string} email - The user's email address
 * @param {string} purpose - The OTP purpose e.g., '2fa', 'reset_password', 'email_verification'
 * @param {string} enteredOtp - The code entered by the user
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const verifyOtpCode = async (email, purpose, enteredOtp) => {
    try {
        if (!email || !purpose || !enteredOtp) {
            return { success: false, message: 'Please provide email, purpose, and OTP passcode' };
        }

        // Retrieve active OTP record
        const otpRecord = await OtpCode.findOne({
            where: { email, purpose, is_verified: false },
            order: [['created_at', 'DESC']]
        });

        if (!otpRecord) {
            return { success: false, message: 'No active OTP verification session found. Please request a new code.' };
        }

        // Check if maximum attempts (3) exceeded
        if (otpRecord.attempts >= 3) {
            return { success: false, message: 'Maximum verification attempts exceeded. Please request a new code.' };
        }

        // Check if expired (5 minutes)
        if (new Date() > new Date(otpRecord.expires_at)) {
            return { success: false, message: 'The OTP verification code has expired. Please request a new one.' };
        }

        // Match entered OTP with the stored hashed code
        const isMatch = await bcrypt.compare(enteredOtp, otpRecord.otp_hash);
        if (!isMatch) {
            otpRecord.attempts += 1;
            await otpRecord.save();

            const remaining = 3 - otpRecord.attempts;
            if (remaining <= 0) {
                return { success: false, message: 'Invalid OTP passcode. Maximum attempts reached. Please request a new code.' };
            }
            return { success: false, message: `Invalid OTP passcode. ${remaining} attempts remaining.` };
        }

        // Mark OTP as verified and delete it (or mark verified)
        otpRecord.is_verified = true;
        await otpRecord.save();

        // Optionally destroy it after success to clean up
        await otpRecord.destroy();

        return {
            success: true,
            message: 'OTP verification successful.'
        };
    } catch (error) {
        console.error('Error verifying OTP code:', error);
        return {
            success: false,
            message: error.message || 'Error occurred while verifying OTP'
        };
    }
};
