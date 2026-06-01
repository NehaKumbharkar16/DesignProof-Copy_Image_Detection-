import express from 'express';

const router = express.Router();

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
        scanId: 'scan_12345'
    });
});

export default router;
