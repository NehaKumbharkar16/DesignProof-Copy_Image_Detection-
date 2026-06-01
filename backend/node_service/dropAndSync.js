import { sequelize } from './src/config/db.js';

async function run() {
    try {
        await sequelize.query('DROP TABLE IF EXISTS "Products" CASCADE');
        await sequelize.query('DROP TABLE IF EXISTS "SentNotices" CASCADE');
        console.log('Tables dropped');

        await sequelize.close();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
