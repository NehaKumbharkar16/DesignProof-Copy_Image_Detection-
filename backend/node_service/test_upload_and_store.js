import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { Product, Detection } from './src/models/index.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key_12345";

// Retrieve or create a user in DB
const userId = '4b1c5ae8-df2a-4d7d-aa19-93a2ecdea374'; // Matching ID from user model seeding/fetching if present
const testToken = jwt.sign({ id: userId, email: 'admin@designproof.com' }, JWT_SECRET, { expiresIn: '1h' });

async function testUploadAndStore() {
    console.log("🧪 Starting programmatic Image Upload & Store test...");
    
    const form = new FormData();
    const imagePath = path.resolve('../python_service/temp_puppy.jpg');
    
    if (!fs.existsSync(imagePath)) {
        console.error(`🔴 Image not found at path: ${imagePath}`);
        process.exit(1);
    }
    
    form.append('image', fs.createReadStream(imagePath));

    try {
        console.log(`📤 Sending upload request to http://127.0.0.1:${PORT}/upload...`);
        const response = await axios.post(`http://127.0.0.1:${PORT}/upload`, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${testToken}`
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 600000 // 10 minutes
        });

        console.log("🟢 Response received!");
        console.log("🟢 Uploaded image URL:", response.data.uploaded_image);
        console.log("🟢 Public Search URL:", response.data.public_search_url);
        console.log("🟢 Counts:", response.data.counts);
        console.log("🟢 Matches Count:", response.data.matching_websites.length);

        // Fetch the last inserted product to see if it has been stored correctly
        const lastProduct = await Product.findOne({
            order: [['created_at', 'DESC']]
        });
        
        if (!lastProduct) {
            console.error("🔴 No products found in the database!");
            process.exit(1);
        }

        console.log(`\n🔍 Database verification for product ID: ${lastProduct.id}`);
        console.log(`- Product Name: ${lastProduct.name}`);
        console.log(`- Image URL: ${lastProduct.primary_image_url}`);
        console.log(`- Public Search URL: ${lastProduct.public_search_url}`);

        const detections = await Detection.findAll({
            where: { product_id: lastProduct.id }
        });
        
        console.log(`- Detections stored in DB: ${detections.length}`);
        if (detections.length > 0) {
            console.log("📄 Sample DB Detections:");
            detections.slice(0, 3).forEach((d, idx) => {
                console.log(`  [${idx+1}] Website: ${d.infringing_url} | Score: ${d.similarity_score}% | Type: ${d.match_type}`);
            });
            console.log("\n✅ Database Persistence works perfectly!");
        } else {
            console.log("\n⚠️ No detections stored (expected if SerpAPI returned no results, but double check SerpAPI log).");
        }
        
        process.exit(0);
    } catch (error) {
        console.error("🔴 Upload test failed!");
        if (error.response) {
            console.error("   Error Data:", error.response.data);
            console.error("   Status Code:", error.response.status);
        } else {
            console.error("   Error Message:", error.message);
        }
        process.exit(1);
    }
}

testUploadAndStore();
