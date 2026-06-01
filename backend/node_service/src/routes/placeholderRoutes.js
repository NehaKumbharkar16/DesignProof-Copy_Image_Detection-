import express from 'express';

const router = express.Router();

// Mock controllers for now to allow server startup without crashing
const mockController = (req, res) => res.json({ message: 'Implemented in next phase' });

router.get('/', mockController);
router.post('/', mockController);
router.get('/:id', mockController);
router.put('/:id', mockController);
router.delete('/:id', mockController);

export default router;
