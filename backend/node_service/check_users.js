import { User } from './src/models/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkUsers() {
    try {
        const users = await User.findAll();
        console.log("Users in database:");
        users.forEach(u => {
            console.log(`- ${u.email} (Role: ${u.role})`);
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkUsers();
