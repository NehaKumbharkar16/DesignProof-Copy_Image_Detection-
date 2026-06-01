import crypto from 'crypto';
import { User, Plan, Payment } from '../models/index.js';
import dotenv from 'dotenv';
import { sendSubscriptionInvoiceEmail } from '../services/mailService.js';

dotenv.config();

// Standard Plan prices in INR (Razorpay uses Indian Rupees for native payment verification in India)
const PLAN_AMOUNTS = {
    'Free': { monthly: 0, annual: 0 },
    'Growth': { monthly: 5999, annual: 49999 },
    'Enterprise': { monthly: 19999, annual: 169999 }
};

export const createOrder = async (req, res) => {
    try {
        const { planName, cycle } = req.body;
        const userId = req.user.id;

        if (!planName || !cycle) {
            return res.status(400).json({ status: 'fail', message: 'Please provide plan name and cycle' });
        }

        const selectedPlan = planName.split(' ')[0]; // Extract "Free", "Growth", or "Enterprise"
        const planRates = PLAN_AMOUNTS[selectedPlan];

        if (!planRates) {
            return res.status(400).json({ status: 'fail', message: 'Invalid subscription plan selected' });
        }

        const price = cycle === 'annual' ? planRates.annual : planRates.monthly;

        // If the price is 0, we can immediately activate the Free plan without payment gateway checkout
        if (price === 0) {
            const user = await User.findByPk(userId);
            user.subscription_plan = planName;
            user.subscription_status = 'active';
            user.expiry_date = null; // Free plans don't expire
            await user.save();

            // Refresh user profile payload
            const refreshedUser = await User.findByPk(userId, { attributes: { exclude: ['password_hash'] } });

            return res.json({
                status: 'success',
                message: 'Successfully switched to Free Starter plan.',
                freeUpgrade: true,
                user: refreshedUser
            });
        }

        const amountInPaise = price * 100; // Razorpay requires amount in smallest currency sub-unit (paise for INR)
        const orderId = `order_${crypto.randomBytes(6).toString('hex')}`;

        // Register a PENDING transaction in our Payments audit log
        await Payment.create({
            user_id: userId,
            amount: price,
            status: 'pending',
            payment_id: orderId,
            method: 'Razorpay'
        });

        // Provide Razorpay initialization config to frontend (using highly detailed Mock credentials if live keys aren't set)
        const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key_52g647d';

        res.json({
            status: 'success',
            order_id: orderId,
            amount: amountInPaise,
            currency: 'INR',
            key_id: keyId,
            planName,
            cycle
        });
    } catch (error) {
        console.error('Create Payment Order Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            planName,
            cycle
        } = req.body;

        const userId = req.user.id;

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({ status: 'fail', message: 'Missing required payment verification credentials' });
        }

        // Validate HMAC signature (only if live key secret exists in .env, otherwise allow mock sandbox confirmation)
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        let isSignatureValid = true;

        if (keySecret && !razorpay_order_id.includes('mock')) {
            const body = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', keySecret)
                .update(body.toString())
                .digest('hex');

            isSignatureValid = expectedSignature === razorpay_signature;
        }

        if (!isSignatureValid) {
            // Update transaction audit record to FAILED
            await Payment.update(
                { status: 'failed' },
                { where: { payment_id: razorpay_order_id } }
            );

            return res.status(400).json({ status: 'fail', message: 'Payment verification failed (Signature mismatch)' });
        }

        // Signature is valid! Upgrade database subscription values
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        // Calculate subscription expiration interval (current date + 30 days or + 365 days)
        const daysToExtend = cycle === 'annual' ? 365 : 30;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + daysToExtend);

        user.subscription_plan = planName;
        user.subscription_status = 'active';
        user.expiry_date = expiryDate;
        await user.save();

        // Update Payment record in Payments Table to SUCCESS
        const paymentRecord = await Payment.findOne({ where: { payment_id: razorpay_order_id } });
        let finalPaidAmount = 0;
        if (paymentRecord) {
            paymentRecord.status = 'success';
            paymentRecord.payment_id = razorpay_payment_id; // Store final actual transaction ID
            paymentRecord.method = 'Card/UPI (Razorpay)';
            await paymentRecord.save();
            finalPaidAmount = paymentRecord.amount;
        } else {
            // Backup transaction log creation if order wasn't saved initially
            const planRates = PLAN_AMOUNTS[planName.split(' ')[0]];
            const finalPrice = cycle === 'annual' ? planRates.annual : planRates.monthly;
            await Payment.create({
                user_id: userId,
                amount: finalPrice,
                status: 'success',
                payment_id: razorpay_payment_id,
                method: 'Card/UPI (Razorpay)'
            });
            finalPaidAmount = finalPrice;
        }

        // Fetch refreshed user data to sync with frontend Context
        const refreshedUser = await User.findByPk(userId, { attributes: { exclude: ['password_hash'] } });

        // Email the subscription invoice receipt in the background asynchronously
        const cleanName = `${refreshedUser.first_name || ''} ${refreshedUser.last_name || ''}`.trim() || 'Subscriber';
        sendSubscriptionInvoiceEmail({
            to: refreshedUser.email,
            userName: cleanName,
            planName: planName,
            amount: finalPaidAmount,
            date: new Date().toISOString().split('T')[0],
            transactionId: razorpay_payment_id,
            method: 'Card/UPI (Razorpay)'
        }).catch(err => console.error('Background Invoice Email Error:', err));

        res.json({
            status: 'success',
            message: 'Payment verified and subscription activated successfully!',
            user: refreshedUser
        });
    } catch (error) {
        console.error('Verify Payment Signature Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const currentSubscription = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['subscription_plan', 'subscription_status', 'expiry_date']
        });

        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        res.json({
            status: 'success',
            subscription: {
                plan: user.subscription_plan,
                status: user.subscription_status,
                expiryDate: user.expiry_date
            }
        });
    } catch (error) {
        console.error('Fetch Current Subscription Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const transactionsHistory = async (req, res) => {
    try {
        const payments = await Payment.findAll({
            where: { user_id: req.user.id },
            order: [['created_at', 'DESC']]
        });

        res.json({
            status: 'success',
            transactions: payments.map(p => {
                let dateStr = '';
                try {
                    if (p.date) {
                        dateStr = (p.date instanceof Date ? p.date : new Date(p.date)).toISOString().split('T')[0];
                    } else if (p.created_at) {
                        dateStr = (p.created_at instanceof Date ? p.created_at : new Date(p.created_at)).toISOString().split('T')[0];
                    } else {
                        dateStr = new Date().toISOString().split('T')[0];
                    }
                } catch (e) {
                    dateStr = new Date().toISOString().split('T')[0];
                }

                const displayAmount = typeof p.amount === 'number' 
                    ? `₹${p.amount.toLocaleString('en-IN')}.00`
                    : `₹${parseFloat(p.amount || 0).toLocaleString('en-IN')}.00`;

                return {
                    id: p.payment_id || (p.id ? `TXN-${p.id.toString().slice(0,8).toUpperCase()}` : `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`),
                    date: dateStr,
                    amount: displayAmount,
                    status: p.status === 'success' ? 'Paid' : p.status === 'pending' ? 'Pending' : 'Failed'
                };
            })
        });
    } catch (error) {
        console.error('Fetch Transactions History Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const cancelSubscription = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        user.subscription_status = 'canceled';
        await user.save();

        const refreshedUser = await User.findByPk(req.user.id, { attributes: { exclude: ['password_hash'] } });

        res.json({
            status: 'success',
            message: 'Subscription has been canceled successfully.',
            user: refreshedUser
        });
    } catch (error) {
        console.error('Cancel Subscription Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};
