import dotenv from 'dotenv';
import app from './app.js';
import { createServer } from 'http';
import { initEnforcementCron } from './services/enforcementCronService.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = createServer(app);

// Increase the timeout to 15 minutes for long scraping requests
server.timeout = 900000;
server.keepAliveTimeout = 900000;
server.headersTimeout = 900000;

server.listen(PORT, () => {
    console.log(`[OK] Server running on http://127.0.0.1:${PORT}`);
    console.log(`[OK] API ready to handle incoming requests.`);
    
    // Start Enforcement Background Jobs
    initEnforcementCron();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! [CRASH] Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
