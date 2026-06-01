import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Mock User
const mockUser = {
    id: '123',
    email: 'brand@example.com',
    password: 'password', // In reality, hashed
    name: 'Brand Admin',
    role: 'client'
};

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (email === mockUser.email && password === mockUser.password) {
        const token = jwt.sign({ id: mockUser.id, role: mockUser.role }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '1d'
        });

        return res.json({
            status: 'success',
            token,
            user: {
                id: mockUser.id,
                email: mockUser.email,
                name: mockUser.name,
                role: mockUser.role
            }
        });
    }

    res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
});

router.post('/register', (req, res) => {
    res.json({
        status: 'success',
        message: 'Registration successful. Please login.',
        // In real app, create user and return token or verify email flow
    });
});

router.get('/me', (req, res) => {
    // Mock verifying token middleware would go here
    res.json({
        status: 'success',
        user: mockUser
    });
});

export default router;
