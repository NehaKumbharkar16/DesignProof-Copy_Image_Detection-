import { sequelize } from './src/config/db.js';
import Product from './src/models/Product.js';
import SentNotice from './src/models/SentNotice.js';
import Detection from './src/models/Detection.js';
import './src/models/index.js'; // Ensure all models are loaded

async function run() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        await sequelize.sync({ force: true });
        console.log('✅ All tables recreated successfully');

        await sequelize.close();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
