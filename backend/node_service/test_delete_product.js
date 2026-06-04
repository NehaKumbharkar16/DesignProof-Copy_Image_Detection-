import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Product, Detection } from './src/models/index.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key_12345";

const userId = '4b1c5ae8-df2a-4d7d-aa19-93a2ecdea374';
const testToken = jwt.sign({ id: userId, email: 'admin@designproof.com' }, JWT_SECRET, { expiresIn: '1h' });

async function testDeleteProduct() {
    console.log("🧪 Testing Product Deletion endpoint...");
    
    // Find the last product in DB
    const lastProduct = await Product.findOne({
        order: [['created_at', 'DESC']]
    });

    if (!lastProduct) {
        console.error("🔴 No products found in database to delete!");
        process.exit(1);
    }

    const productId = lastProduct.id;
    console.log(`🔍 Found target product to delete: Name: ${lastProduct.name} | ID: ${productId}`);

    try {
        console.log(`🗑️ Sending DELETE request to http://127.0.0.1:${PORT}/api/products/${productId}...`);
        const response = await axios.delete(`http://127.0.0.1:${PORT}/api/products/${productId}`, {
            headers: {
                Authorization: `Bearer ${testToken}`
            }
        });

        console.log("🟢 Response status:", response.status);
        console.log("🟢 Response data:", response.data);

        // Verify it was deleted from DB
        const checkProduct = await Product.findByPk(productId);
        if (!checkProduct) {
            console.log("✅ Product successfully removed from products table.");
        } else {
            console.error("🔴 Product still exists in products table!");
        }

        const checkDetections = await Detection.findAll({
            where: { product_id: productId }
        });

        if (checkDetections.length === 0) {
            console.log("✅ All associated detections successfully cascaded and removed from detected_matches table.");
        } else {
            console.error(`🔴 Detections still exist for product! Count: ${checkDetections.length}`);
        }

        process.exit(0);
    } catch (error) {
        console.error("🔴 Deletion test failed!");
        if (error.response) {
            console.error("   Error Data:", error.response.data);
            console.error("   Status Code:", error.response.status);
        } else {
            console.error("   Error Message:", error.message);
        }
        process.exit(1);
    }
}

testDeleteProduct();
