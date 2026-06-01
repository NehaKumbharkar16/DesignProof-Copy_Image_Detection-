import express from 'express'; // restart trigger
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import placeholderRoutes from './routes/placeholderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import detectionRoutes from './routes/detectionRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import { protect } from './middlewares/authMiddleware.js';
import session from 'express-session';
import passport from './config/passport.js';

// Connect to Database
connectDB();

const app = express();

// Global Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// Session Configuration (Required for Passport)
app.use(session({
    secret: process.env.SESSION_SECRET || 'designproof_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/brands', placeholderRoutes);
app.use('/api/products', placeholderRoutes);
app.use('/api/detections', detectionRoutes);
app.use('/api/takedowns', placeholderRoutes);
app.use('/api/subscriptions', protect, subscriptionRoutes);
app.use('/api/notices', protect, noticeRoutes);

// Gateway Routes that proxy to Python Service
app.use('/', uploadRoutes);

// Proxy uploads directory from Python service
app.use('/uploads', async (req, res) => {
    // Redirection proxy for development
    res.redirect(`http://127.0.0.1:5001/uploads${req.url}`);
});

// Health Check
app.get('/', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is Ready! Node.js Gateway running successfully.' });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Backend Gateway is running' });
});

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('💥 [Global Error Handler]:');
    console.error(err.stack || err);
    
    // Specifically log Axios errors if they occur
    if (err.isAxiosError) {
        console.error('📡 Axios Error Details:', {
            url: err.config?.url,
            method: err.config?.method,
            status: err.response?.status,
            data: err.response?.data
        });
    }

    res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        message: err.message || 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

export default app;
