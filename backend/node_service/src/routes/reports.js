import express from 'express';

const router = express.Router();

router.get('/summary', (req, res) => {
    res.json({
        status: 'success',
        data: {
            revenueProtected: 12500,
            takedownsCompleted: 45,
            successRate: 98
        }
    });
});

export default router;
