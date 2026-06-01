import cron from 'node-cron';
import axios from 'axios';
import { Detection, Brand } from '../models/index.js';
import { sendLegalNoticeEmail } from './mailService.js';
import dotenv from 'dotenv';

dotenv.config();

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:5001';

/**
 * Enforcement Cron Service
 * Handles automatic re-crawling of infringing URLs and escalation of legal notices.
 */
export const initEnforcementCron = () => {
    console.log('[Cron] Initializing Enforcement Workflow Service...');

    // 1. Re-check removal status every 4 hours
    // This job re-crawls websites to see if the infringing image is still there.
    cron.schedule('0 */4 * * *', async () => {
        console.log('[Cron] Starting scheduled removal check...');
        try {
            const pendingDetections = await Detection.findAll({
                where: {
                    enforcement_status: 'waiting_for_removal',
                    is_removed: false
                },
                include: [{ model: Brand, as: 'brand' }]
            });

            console.log(`[Cron] Found ${pendingDetections.length} detections waiting for removal.`);

            for (const detection of pendingDetections) {
                try {
                    console.log(`[Cron] Re-verifying: ${detection.infringing_url}`);
                    
                    const response = await axios.post(`${PYTHON_SERVICE_URL}/reverify`, {
                        website_url: detection.infringing_url,
                        original_image_url: detection.infringing_image_url // Re-using existing infringing image as base for comparison
                    });

                    const { is_removed } = response.data;

                    if (is_removed) {
                        console.log(`[Cron] ✅ Image REMOVED from ${detection.infringing_url}`);
                        await detection.update({
                            is_removed: true,
                            enforcement_status: 'removed',
                            last_checked_at: new Date()
                        });
                    } else {
                        console.log(`[Cron] ❌ Image STILL PRESENT on ${detection.infringing_url}`);
                        await detection.update({
                            last_checked_at: new Date()
                        });
                    }
                } catch (err) {
                    console.error(`[Cron] Error re-verifying ${detection.id}:`, err.message);
                }
            }
        } catch (error) {
            console.error('[Cron] Removal Check Job failed:', error);
        }
    });

    // 2. Escalation Job: Send 2nd notice if deadline passed
    // Runs every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        console.log('[Cron] Starting escalation check (2nd Notice)...');
        try {
            const now = new Date();
            const overdueDetections = await Detection.findAll({
                where: {
                    enforcement_status: 'waiting_for_removal',
                    is_removed: false,
                    second_notice_sent_at: null,
                    deadline_at: {
                        [Symbol.for('lte')]: now // Sequelize lte
                    }
                },
                include: [{ model: Brand, as: 'brand' }]
            });

            console.log(`[Cron] Found ${overdueDetections.length} detections overdue for 2nd notice.`);

            for (const detection of overdueDetections) {
                try {
                    // Send Second Notice
                    const mailResult = await sendLegalNoticeEmail({
                        to: detection.contact_email,
                        subject: `FINAL WARNING: Continued Unauthorized Use of Copyrighted Image - ${detection.brand?.name || 'DesignProof Client'}`,
                        brandName: detection.brand?.name || 'DesignProof Client',
                        websiteUrl: detection.infringing_url,
                        originalImageUrl: detection.infringing_image_url,
                        customMessage: `FINAL NOTICE.\n\nOur records show that the copyrighted image belonging to ${detection.brand?.name || 'DesignProof Client'} is STILL present on your website (${detection.infringing_url}) despite our previous notice.\n\nThis is your FINAL WARNING. If the image is not removed within 24 hours, we will proceed with formal legal action, DMCA takedown requests to your hosting provider, and potentially civil litigation.\n\nPlease remove the image immediately.\n\nRegards,\nEnforcement Team`
                    });

                    if (mailResult.success) {
                        console.log(`[Cron] 📨 SECOND NOTICE sent to ${detection.contact_email}`);
                        await detection.update({
                            second_notice_sent_at: new Date(),
                            enforcement_status: 'second_notice_sent'
                        });
                    }
                } catch (err) {
                    console.error(`[Cron] Error escalating ${detection.id}:`, err.message);
                }
            }
        } catch (error) {
            console.error('[Cron] Escalation Job failed:', error);
        }
    });
};
