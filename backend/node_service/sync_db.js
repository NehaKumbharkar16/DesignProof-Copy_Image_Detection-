import sequelize from './src/config/db.js';
import { User } from './src/models/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function syncDB() {
    try {
        await User.sync({ alter: true });
        console.log("User table synchronized with new columns.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

syncDB();
