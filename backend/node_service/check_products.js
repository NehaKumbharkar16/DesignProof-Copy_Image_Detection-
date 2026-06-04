import { Product, Detection, Brand } from './src/models/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkProducts() {
    try {
        const brands = await Brand.findAll();
        console.log(`\nBrands count: ${brands.length}`);
        brands.forEach(b => {
            console.log(`- Brand: ${b.name} (ID: ${b.id}, Owner: ${b.owner_id})`);
        });

        const products = await Product.findAll();
        console.log(`\nProducts count: ${products.length}`);
        for (const p of products) {
            const detectionsCount = await Detection.count({ where: { product_id: p.id } });
            console.log(`- Product: ${p.name} (ID: ${p.id})`);
            console.log(`  Public Search URL: ${p.public_search_url}`);
            console.log(`  Detections Count: ${detectionsCount}`);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkProducts();
