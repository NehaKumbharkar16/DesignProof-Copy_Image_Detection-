import { User, Brand } from './src/models/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function createDemoUser() {
    try {
        const email = 'google-demo@designproof.ai';
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            console.log("Demo user already exists. Updating password...");
            userExists.password_hash = 'password';
            await userExists.save();
        } else {
            console.log("Creating demo user...");
            const user = await User.create({
                first_name: 'Google',
                last_name: 'Demo',
                email,
                password_hash: 'password',
                role: 'client'
            });
            await Brand.create({
                owner_id: user.id,
                name: 'Demo Brand',
                website_url: 'https://demo.designproof.ai'
            });
        }
        console.log("Success!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

createDemoUser();
