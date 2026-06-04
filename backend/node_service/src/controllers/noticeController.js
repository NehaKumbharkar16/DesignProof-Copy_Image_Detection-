import { SentNotice, Detection } from '../models/index.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { sendNoticeThroughPython } from '../services/pythonService.js';

export const sendLegalNotice = async (req, res, next) => {
    try {
        const {
            detected_match_id, // Added this field
            email,
            brand_name,
            website_url,
            original_image_url,
            copied_image_url,
            content
        } = req.body;

        if (!email || !website_url || !original_image_url) {
            return errorResponse(res, 'Missing required fields: email, website_url, original_image_url', null, 400);
        }

        // 1. Send Email via Python Service
        console.log(`[Node] Forwarding notice request to Python AI service for ${email}...`);
        
        let emailResult;
        try {
            emailResult = await sendNoticeThroughPython({
                email,
                brand_name: brand_name || 'DesignProof Client',
                website_url,
                original_image_url,
                copied_image_url,
                content
            });
        } catch (err) {
            console.error(`[WARN] Notice email failed: ${err.message}`);
            emailResult = {
                success: false,
                error: err.response?.data?.error || err.message
            };
        }

        const statusStr = emailResult.success ? 'Sent' : `Failed (${emailResult.error || 'Unknown error'})`;

        // 2. Save Notice Record to Database
        const noticeRecord = await SentNotice.create({
            recipientEmail: email,
            websiteUrl: website_url,
            originalImageUrl: original_image_url,
            copiedImageUrl: copied_image_url,
            content: content || 'Standard Template Applied',
            status: statusStr,
            sentAt: new Date()
        });

        // 3. NEW: Update Enforcement Tracking in detected_matches if ID is provided
        if (detected_match_id && emailResult.success) {
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + 3); // 3 days deadline

            await Detection.update({
                first_notice_sent_at: new Date(),
                deadline_at: deadline,
                enforcement_status: 'waiting_for_removal',
                client_status: 'approved'
            }, {
                where: { id: detected_match_id }
            });
        }

        if (!emailResult.success) {
            return errorResponse(res, emailResult.error || 'Failed to send notice', { record: noticeRecord }, 400);
        }

        return successResponse(res, 'Notice sent successfully and saved to database.', {
            record: noticeRecord
        });

    } catch (error) {
        next(error);
    }
};

export const getLegalNoticesCount = async (req, res, next) => {
    try {
        const count = await SentNotice.count();
        return successResponse(res, 'Notices count fetched successfully', { count });
    } catch (error) {
        next(error);
    }
};

export const getLegalNotices = async (req, res, next) => {
    try {
        const notices = await SentNotice.findAll({
            order: [['created_at', 'DESC']]
        });
        return successResponse(res, 'Notices fetched successfully', notices);
    } catch (error) {
        next(error);
    }
};

export const updateNoticeStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const notice = await SentNotice.findByPk(id);
        if (!notice) {
            return errorResponse(res, 'Notice not found', null, 404);
        }

        notice.status = status;
        await notice.save();

        return successResponse(res, 'Notice status updated successfully', notice);
    } catch (error) {
        next(error);
    }
};

export const resendLegalNotice = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notice = await SentNotice.findByPk(id);
        if (!notice) {
            return errorResponse(res, 'Notice not found', null, 404);
        }

        console.log(`[Node] Resending notice request to Python AI service for ${notice.recipientEmail}...`);
        
        let emailResult;
        try {
            emailResult = await sendNoticeThroughPython({
                email: notice.recipientEmail,
                brand_name: 'DesignProof Client',
                website_url: notice.websiteUrl,
                original_image_url: notice.originalImageUrl,
                copied_image_url: notice.copiedImageUrl,
                content: notice.content
            });
        } catch (err) {
            console.error(`[WARN] Resend notice email failed: ${err.message}`);
            emailResult = {
                success: false,
                error: err.response?.data?.error || err.message
            };
        }

        const statusStr = emailResult.success ? 'Sent' : `Failed (${emailResult.error || 'Unknown error'})`;
        notice.status = statusStr;
        notice.sentAt = new Date();
        await notice.save();

        if (!emailResult.success) {
            return errorResponse(res, emailResult.error || 'Failed to resend notice', { record: notice }, 400);
        }

        return successResponse(res, 'Notice resent successfully.', notice);
    } catch (error) {
        next(error);
    }
};

export const deleteNotice = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notice = await SentNotice.findByPk(id);
        if (!notice) {
            return errorResponse(res, 'Notice not found', null, 404);
        }

        await notice.destroy();
        return successResponse(res, 'Notice deleted successfully', null);
    } catch (error) {
        next(error);
    }
};



