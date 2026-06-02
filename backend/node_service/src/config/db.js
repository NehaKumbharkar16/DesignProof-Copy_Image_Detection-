import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

console.log('[DB Debug] isProduction:', isProduction);
console.log('[DB Debug] process.env.NODE_ENV:', process.env.NODE_ENV);
console.log('[DB Debug] DATABASE_URL is present:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
    console.log('[DB Debug] DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 15) + '...');
} else {
    console.log('[DB Debug] DATABASE_URL is not set. Falling back to DB_HOST:', process.env.DB_HOST);
}

export const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: console.log,
        dialectOptions: isProduction ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        } : {}
      })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: 'postgres',
            logging: console.log,
            dialectOptions: isProduction ? {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            } : {}
        }
      );

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('[OK] Database connected (PostgreSQL Connection Established).');

        // Set force: false to preserve data after initial UUID migration
        await sequelize.sync({ force: false, alter: true });
        console.log('[OK] Database synchronized (Persistence enabled).');

        // Seed default plans dynamically
        const Plan = (await import('../models/Plan.js')).default;
        const plansToSeed = [
            { plan_name: 'Free', price: 0, duration: 'monthly', features: ['50 credits/month', 'Weekly monitoring', 'Basic reverse image search'] },
            { plan_name: 'Growth', price: 79, duration: 'monthly', features: ['150 credits/month', 'Shopify & Marketplace monitoring', 'AI infringement detection', 'Automated DMCA takedowns (5/mo)', 'Priority email support'] },
            { plan_name: 'Enterprise', price: 249, duration: 'monthly', features: ['Unlimited automated scans', 'Full social media & ad library crawler', 'Automated DMCA takedowns (Unlimited)', 'Dedicated IP attorney consultation', 'REST API & Webhooks access'] }
        ];
        
        for (const p of plansToSeed) {
            await Plan.findOrCreate({
                where: { plan_name: p.plan_name },
                defaults: p
            });
        }
        console.log('[OK] Seeded subscription plans.');
    } catch (error) {
        console.error('[ERR] Unable to connect to the PostgreSQL database:', error);
        console.warn('[WARN] Server running, but DB connection failed.');
    }
};

export default sequelize;
