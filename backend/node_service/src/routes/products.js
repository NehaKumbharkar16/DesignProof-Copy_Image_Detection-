import express from 'express';

const router = express.Router();

const products = [
    { id: 1, name: 'Design A', sku: 'SKU001', image: 'url1', status: 'active' },
    { id: 2, name: 'Design B', sku: 'SKU002', image: 'url2', status: 'active' },
];

router.get('/', (req, res) => {
    res.json({
        status: 'success',
        results: products.length,
        data: products
    });
});

router.post('/', (req, res) => {
    const newProduct = { id: products.length + 1, ...req.body, status: 'active' };
    products.push(newProduct);
    res.status(201).json({
        status: 'success',
        data: newProduct
    });
});

export default router;
