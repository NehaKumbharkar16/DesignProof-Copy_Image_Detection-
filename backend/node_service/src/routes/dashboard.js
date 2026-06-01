import express from 'express';

const router = express.Router();

router.get('/stats', (req, res) => {
    res.json({
        status: 'success',
        data: {
            totalDesigns: 120,
            activeScans: 10,
            matchesFound: 35,
            takedownsSent: 28,
            removed: 5,
            riskScore: 'Low',
            recentActivity: [
                { id: 1, type: 'success', text: 'Scan completed', time: '2 mins ago' },
                { id: 2, type: 'warning', text: '3 matches found', time: '15 mins ago' }
            ]
        }
    });
});

export default router;
