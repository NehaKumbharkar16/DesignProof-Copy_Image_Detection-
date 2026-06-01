import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter using Ethereal (Mock) or configure your own SMTP
const createTransporter = async () => {
    // Determine if using Ethereal or Gmail from Env
    const smtpHost = process.env.SMTP_HOST || 'smtp.ethereal.email';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.EMAIL_USER;
    const smtpPass = process.env.EMAIL_PASS;

    let transporter;

    if (smtpUser && smtpPass) {
        const isGmail = smtpHost.includes('gmail') || smtpUser.includes('gmail');
        if (isGmail) {
            // Use native Gmail service configuration which is extremely robust
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
        } else {
            // Use configured credentials with TLS support
            transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465, // true for 465, false for other ports
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
        }
    } else {
        // Fallback to ethereal if no credentials are provided
        console.warn('⚠️ No SMTP credentials found. Creating an ethereal test account.');
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    return transporter;
};

export const sendLegalNoticeEmail = async ({ to, subject, brandName, websiteUrl, originalImageUrl, copiedImageUrl, customMessage }) => {
    try {
        const transporter = await createTransporter();

        const mailOptions = {
            from: `"Legal Team" <${transporter.options.auth.user}>`,
            to: to,
            subject: subject || `URGENT: Unauthorized Use of Copyrighted Image - ${brandName}`,
            text: customMessage || `Hello,\n\nIt has come to our attention that an image belonging to ${brandName} is being used without authorization on your website.\n\nWebsite containing the image: ${websiteUrl}\nOriginal Image URL: ${originalImageUrl}\nCopied Image URL: ${copiedImageUrl || 'N/A'}\n\nWe kindly request you to remove this image from your website within 2-3 business days. Failure to comply may result in further legal action to protect the intellectual property of ${brandName}.\n\nRegards,\nLegal Team on behalf of ${brandName}`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ [Node.js] EMAIL SENT SUCCESSFULLY!`);
        console.log(`  | To: ${to}`);
        console.log(`  | Brand: ${brandName}`);

        // Show ethereal URL if it's an ethereal account
        if (info.messageId && transporter.options.host.includes('ethereal')) {
            console.log(`  | View Mock Email Inbox at: ${nodemailer.getTestMessageUrl(info)}`);
        }

        return { success: true, info };
    } catch (error) {
        console.error('❌ [Node.js] Failed to send email:', error);
        return { success: false, error: error.message };
    }
};

export const send2FAOtpEmail = async ({ to, otp, userName }) => {
    try {
        const transporter = await createTransporter();

        const mailOptions = {
            from: `"DesignProof Security" <${transporter.options.auth.user}>`,
            to: to,
            subject: 'DesignProof - Your Two-Factor Authentication OTP Code',
            text: `Hello ${userName || 'User'},\n\nYou are receiving this email because you requested a login or enabled two-factor authentication on DesignProof.\n\nYour 6-digit OTP verification code is:\n\n${otp}\n\nThis code will expire in 5 minutes. If you did not request this, please change your password immediately.\n\nRegards,\nDesignProof Security Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #0f172a; margin: 0;">DesignProof Security</h2>
                        <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Two-Factor Authentication (2FA)</p>
                    </div>
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); text-align: center;">
                        <p style="color: #334155; font-size: 16px; margin-top: 0; text-align: left;">Hello ${userName || 'User'},</p>
                        <p style="color: #475569; font-size: 14px; line-height: 1.5; text-align: left;">Use the following secure one-time passcode to log in to your account. This code is valid for <b>5 minutes</b>.</p>
                        <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #d97706; margin: 24px 0; padding: 12px; border: 2px dashed #f59e0b; border-radius: 8px; background-color: #fffbeb; display: inline-block; width: 200px;">
                            ${otp}
                        </div>
                        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0; text-align: center; border-top: 1px solid #e2e8f0; pt-4; margin-top: 20px; padding-top: 15px;">If you did not attempt to sign in, please secure your account by updating your password.</p>
                    </div>
                    <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
                        &copy; 2026 DesignProof. All rights reserved.
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ [Node.js] 2FA OTP EMAIL SENT SUCCESSFULLY!`);
        console.log(`  | To: ${to}`);

        if (info.messageId && transporter.options.host.includes('ethereal')) {
            console.log(`  | View Mock Email Inbox at: ${nodemailer.getTestMessageUrl(info)}`);
        }

        return { success: true, info };
    } catch (error) {
        console.error('❌ [Node.js] Failed to send 2FA OTP email:', error);
        return { success: false, error: error.message };
    }
};

export const sendPasswordResetOtpEmail = async ({ to, otp, userName }) => {
    try {
        const transporter = await createTransporter();

        const mailOptions = {
            from: `"DesignProof Security" <${transporter.options.auth.user}>`,
            to: to,
            subject: 'DesignProof - Your Password Reset OTP Code',
            text: `Hello ${userName || 'User'},\n\nYou are receiving this email because you requested to reset your password on DesignProof.\n\nYour 6-digit verification code is:\n\n${otp}\n\nThis code will expire in 10 minutes. If you did not request this, you can safely ignore this email.\n\nRegards,\nDesignProof Security Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #0f172a; margin: 0;">DesignProof Security</h2>
                        <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Password Recovery Verification</p>
                    </div>
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); text-align: center;">
                        <p style="color: #334155; font-size: 16px; margin-top: 0; text-align: left;">Hello ${userName || 'User'},</p>
                        <p style="color: #475569; font-size: 14px; line-height: 1.5; text-align: left;">Use the following secure 6-digit OTP code to verify your identity and reset your password. This code is valid for <b>10 minutes</b>.</p>
                        <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1e3a8a; margin: 24px 0; padding: 12px; border: 2px dashed #3b82f6; border-radius: 8px; background-color: #eff6ff; display: inline-block; width: 200px;">
                            ${otp}
                        </div>
                        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0; text-align: center; border-top: 1px solid #e2e8f0; margin-top: 20px; padding-top: 15px;">If you did not make this request, please ignore this email or contact support if you have concerns.</p>
                    </div>
                    <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
                        &copy; 2026 DesignProof. All rights reserved.
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ [Node.js] PASSWORD RESET OTP EMAIL SENT SUCCESSFULLY!`);
        console.log(`  | To: ${to}`);

        if (info.messageId && transporter.options.host.includes('ethereal')) {
            console.log(`  | View Mock Email Inbox at: ${nodemailer.getTestMessageUrl(info)}`);
        }

        return { success: true, info };
    } catch (error) {
        console.error('❌ [Node.js] Failed to send password reset OTP email:', error);
        return { success: false, error: error.message };
    }
};

export const sendGenericOtpEmail = async ({ to, otp, purpose, userName }) => {
    try {
        const transporter = await createTransporter();
        
        let subject = 'DesignProof - Your Verification Code';
        let purposeText = 'Identity Verification';
        let description = 'Use the following secure 6-digit OTP code to verify your identity. This code is valid for 5 minutes.';
        
        if (purpose === '2fa') {
            subject = 'DesignProof - Your Two-Factor Authentication OTP Code';
            purposeText = 'Two-Factor Authentication (2FA)';
            description = 'Use the following secure 6-digit OTP code to log in to your account. This code is valid for 5 minutes.';
        } else if (purpose === 'reset_password') {
            subject = 'DesignProof - Your Password Reset OTP Code';
            purposeText = 'Password Recovery Verification';
            description = 'Use the following secure 6-digit OTP code to verify your identity and reset your password. This code is valid for 5 minutes.';
        } else if (purpose === 'email_verification') {
            subject = 'DesignProof - Your Email Verification OTP Code';
            purposeText = 'Email Verification';
            description = 'Use the following secure 6-digit OTP code to verify your email address. This code is valid for 5 minutes.';
        }

        const mailOptions = {
            from: `"DesignProof Security" <${transporter.options.auth.user}>`,
            to: to,
            subject: subject,
            text: `Hello ${userName || 'User'},\n\nYour 6-digit verification code is:\n\n${otp}\n\nThis code will expire in 5 minutes.\n\nRegards,\nDesignProof Security Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #0f172a; margin: 0;">DesignProof Security</h2>
                        <p style="color: #64748b; font-size: 14px; margin-top: 5px;">${purposeText}</p>
                    </div>
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); text-align: center;">
                        <p style="color: #334155; font-size: 16px; margin-top: 0; text-align: left;">Hello ${userName || 'User'},</p>
                        <p style="color: #475569; font-size: 14px; line-height: 1.5; text-align: left;">${description}</p>
                        <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1e3a8a; margin: 24px 0; padding: 12px; border: 2px dashed #3b82f6; border-radius: 8px; background-color: #eff6ff; display: inline-block; width: 200px;">
                            ${otp}
                        </div>
                        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0; text-align: center; border-top: 1px solid #e2e8f0; margin-top: 20px; padding-top: 15px;">If you did not make this request, please ignore this email or contact support if you have concerns.</p>
                    </div>
                    <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
                        &copy; 2026 DesignProof. All rights reserved.
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ [Node.js] OTP EMAIL SENT SUCCESSFULLY! (Purpose: ${purpose})`);
        console.log(`  | To: ${to}`);

        if (info.messageId && transporter.options.host.includes('ethereal')) {
            console.log(`  | View Mock Email Inbox at: ${nodemailer.getTestMessageUrl(info)}`);
        }

        return { success: true, info };
    } catch (error) {
        console.error('❌ [Node.js] Failed to send OTP email:', error);
        return { success: false, error: error.message };
    }
};

export const sendSubscriptionInvoiceEmail = async ({ to, userName, planName, amount, date, transactionId, method }) => {
    try {
        const transporter = await createTransporter();

        const mailOptions = {
            from: `"DesignProof Billing" <${transporter.options.auth.user}>`,
            to: to,
            subject: `DesignProof Invoice Receipt: ${planName} Plan`,
            text: `Hello ${userName || 'User'},\n\nThank you for subscribing to DesignProof! Your payment of ₹${amount.toLocaleString('en-IN')}.00 has been received successfully.\n\nTransaction Details:\n- Plan: ${planName}\n- Transaction ID: ${transactionId}\n- Date: ${date}\n- Method: ${method}\n\nYour brand assets are now actively protected on our secure network. You can view or download past receipts inside your dashboard.\n\nRegards,\nDesignProof Billing Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <h2 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">DesignProof</h2>
                        <span style="background-color: #d97706; color: white; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 20px; text-transform: uppercase; margin-top: 5px; display: inline-block; letter-spacing: 1px;">Invoice Receipt</span>
                    </div>
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                        <p style="color: #334155; font-size: 16px; margin-top: 0;">Hello <strong>${userName || 'Subscriber'}</strong>,</p>
                        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Thank you for your purchase! Your payment has been securely processed, and your DesignProof subscription is active. Here is a summary of your transaction:</p>
                        
                        <!-- Transaction Info Box -->
                        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #475569;">
                                <tr>
                                    <td style="padding: 4px 0; font-weight: bold; width: 40%;">Transaction ID:</td>
                                    <td style="padding: 4px 0; color: #0f172a;">${transactionId}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0; font-weight: bold;">Date:</td>
                                    <td style="padding: 4px 0; color: #0f172a;">${date}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0; font-weight: bold;">Payment Method:</td>
                                    <td style="padding: 4px 0; color: #0f172a;">${method}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0; font-weight: bold;">Status:</td>
                                    <td style="padding: 4px 0; color: #16a34a; font-weight: bold;">PAID / CONFIRMED</td>
                                </tr>
                            </table>
                        </div>

                        <!-- Purchase Details Table -->
                        <table style="width: 100%; border-collapse: collapse; margin-top: 25px;">
                            <thead>
                                <tr style="border-bottom: 2px solid #e2e8f0; text-align: left;">
                                    <th style="padding: 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Item Description</th>
                                    <th style="padding: 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold; text-align: right;">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 12px 0;">
                                        <div style="font-weight: bold; color: #0f172a; font-size: 14px;">DesignProof ${planName} Subscription</div>
                                        <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Premium AI-Powered Intellectual Property Protection Scan Quota</div>
                                    </td>
                                    <td style="padding: 12px 0; font-weight: bold; color: #0f172a; text-align: right; font-size: 14px;">₹${amount.toLocaleString('en-IN')}.00</td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px 0 0 0; font-weight: bold; font-size: 15px; color: #0f172a;">Total Billed:</td>
                                    <td style="padding: 15px 0 0 0; font-weight: 800; font-size: 18px; color: #d97706; text-align: right;">₹${amount.toLocaleString('en-IN')}.00</td>
                                </tr>
                            </tbody>
                        </table>

                        <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin-top: 35px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center;">
                            Need help or have questions? Contact our support desk at <a href="mailto:support@designproof.ai" style="color: #d97706; text-decoration: none; font-weight: 600;">support@designproof.ai</a>. You can manage your subscription settings and billing preferences directly in your <a href="http://localhost:3001/subscription" style="color: #d97706; text-decoration: none; font-weight: 600;">dashboard</a>.
                        </p>
                    </div>
                    <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 11px; letter-spacing: 0.5px;">
                        &copy; 2026 DesignProof Security. All rights reserved.<br>
                        Safeguarding digital artwork and original retail designs with state-of-the-art AI.
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ [Node.js] INVOICE EMAIL SENT SUCCESSFULLY TO ${to}!`);
        return { success: true, info };
    } catch (error) {
        console.error('❌ [Node.js] Failed to send invoice email:', error);
        return { success: false, error: error.message };
    }
};


