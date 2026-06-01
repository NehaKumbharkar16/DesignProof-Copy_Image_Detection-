import { User } from './src/models/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function testLogin() {
    try {
        const user = await User.findOne({ where: { email: 'neha@gmail.com' } });
        if (!user) {
            console.log("User not found");
            process.exit(1);
        }
        const match = await user.matchPassword('password');
        console.log(`Password match for neha@gmail.com: ${match}`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testLogin();
