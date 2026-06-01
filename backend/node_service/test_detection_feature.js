import axios from 'axios';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key_12345";

// Mock a token for bypass
const testToken = jwt.sign({ id: 1, email: 'admin@designproof.com' }, JWT_SECRET, { expiresIn: '1h' });

const testDetection = async () => {
    console.log("🧪 Testing Brand Protection Detection Feature...");
    
    // Using the React logo as a test image (common across web)
    const testImageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png";
    const testProductId = 101; 

    try {
        const response = await axios.post(`http://127.0.0.1:${PORT}/api/detections/scan`, {
            imageUrl: testImageUrl,
            productId: testProductId
        }, {
            headers: {
                Authorization: `Bearer ${testToken}`
            }
        });

        console.log("🟢 API Response Status:", response.data.status);
        console.log("🟢 Matches Found:", response.data.results_count);
        console.log("🟢 Scan Duration:", response.data.scan_duration_seconds, "seconds");
        
        if (response.data.data.length > 0) {
            console.log("📄 Sample Results:");
            response.data.data.slice(0, 3).forEach((item, i) => {
                console.log(`   [${i+1}] Website: ${item.website} | Similarity: ${item.similarity}%`);
            });
        }

        console.log("\n✅ Test passed successfully!");
    } catch (error) {
        console.error("🔴 Test failed!");
        if (error.response) {
            console.error("   Error Data:", error.response.data);
        } else {
            console.error("   Error Message:", error.message);
        }
    }
};

testDetection();
