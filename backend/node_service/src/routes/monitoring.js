import express from 'express';
import { Brand } from '../models/index.js';
import crypto from 'crypto';

const router = express.Router();

// Fetch monitoring settings for the authenticated user's brand
router.get('/', async (req, res) => {
    try {
        const targetUser = req.user || { id: '00000000-0000-0000-0000-000000000000' };
        let brand = await Brand.findOne({ where: { owner_id: targetUser.id } });
        if (!brand) {
            brand = await Brand.create({
                id: crypto.randomUUID(),
                owner_id: targetUser.id,
                name: "Default Dev Brand"
            });
        }
        return res.json({
            status: 'success',
            data: {
                scan_type: brand.scan_type,
                scan_frequency: brand.scan_frequency,
                monitor_d2c: brand.monitor_d2c,
                monitor_shopify: brand.monitor_shopify,
                monitor_marketplaces: brand.monitor_marketplaces,
                monitor_google_images: brand.monitor_google_images,
                monitor_social_media: brand.monitor_social_media
            }
        });
    } catch (error) {
        console.error('Error fetching monitoring settings:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to fetch monitoring settings' });
    }
});

// Update monitoring settings for the authenticated user's brand
router.put('/', async (req, res) => {
    try {
        const targetUser = req.user || { id: '00000000-0000-0000-0000-000000000000' };
        let brand = await Brand.findOne({ where: { owner_id: targetUser.id } });
        if (!brand) {
            brand = await Brand.create({
                id: crypto.randomUUID(),
                owner_id: targetUser.id,
                name: "Default Dev Brand"
            });
        }

        const {
            scan_type,
            scan_frequency,
            monitor_d2c,
            monitor_shopify,
            monitor_marketplaces,
            monitor_google_images,
            monitor_social_media
        } = req.body;

        await brand.update({
            scan_type: scan_type !== undefined ? scan_type : brand.scan_type,
            scan_frequency: scan_frequency !== undefined ? scan_frequency : brand.scan_frequency,
            monitor_d2c: monitor_d2c !== undefined ? monitor_d2c : brand.monitor_d2c,
            monitor_shopify: monitor_shopify !== undefined ? monitor_shopify : brand.monitor_shopify,
            monitor_marketplaces: monitor_marketplaces !== undefined ? monitor_marketplaces : brand.monitor_marketplaces,
            monitor_google_images: monitor_google_images !== undefined ? monitor_google_images : brand.monitor_google_images,
            monitor_social_media: monitor_social_media !== undefined ? monitor_social_media : brand.monitor_social_media
        });

        return res.json({
            status: 'success',
            message: 'Monitoring settings updated successfully',
            data: {
                scan_type: brand.scan_type,
                scan_frequency: brand.scan_frequency,
                monitor_d2c: brand.monitor_d2c,
                monitor_shopify: brand.monitor_shopify,
                monitor_marketplaces: brand.monitor_marketplaces,
                monitor_google_images: brand.monitor_google_images,
                monitor_social_media: brand.monitor_social_media
            }
        });
    } catch (error) {
        console.error('Error updating monitoring settings:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to update monitoring settings' });
    }
});

// Legacy / status routes
router.get('/status', (req, res) => {
    res.json({
        status: 'success',
        data: {
            isMonitoring: true,
            lastScan: new Date().toISOString(),
            sources: ['Shopify', 'Amazon', 'Etsy', 'Google Images']
        }
    });
});

router.post('/scan', (req, res) => {
    res.json({
        status: 'success',
        message: 'Scan initiated successfully',
        scanId: 'scan_' + Math.random().toString(36).substring(2, 11)
    });
});

export default router;
