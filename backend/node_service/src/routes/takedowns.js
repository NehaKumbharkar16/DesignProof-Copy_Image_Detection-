import express from 'express';

const router = express.Router();

const takedowns = [
    { id: 1, brand: 'MyBrand', infringer: 'CopyCat', status: 'pending' },
    { id: 2, brand: 'MyBrand', infringer: 'ThiefStore', status: 'sent' }
];

router.get('/', (req, res) => {
    res.json({
        status: 'success',
        results: takedowns.length,
        data: takedowns
    });
});

router.post('/:id/approve', (req, res) => {
    const { id } = req.params;
    const takedown = takedowns.find(t => t.id == id);
    if (takedown) takedown.status = 'sent';
    res.json({ status: 'success', message: 'Takedown approved and sent', data: takedown });
});

export default router;
