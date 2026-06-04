import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { SentNotice } from './src/models/index.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key_12345";

const userId = '4b1c5ae8-df2a-4d7d-aa19-93a2ecdea374';
const testToken = jwt.sign({ id: userId, email: 'admin@designproof.com' }, JWT_SECRET, { expiresIn: '1h' });

async function testTakedownFlow() {
    console.log("🧪 Starting programmatic Takedowns & Notice CRUD flow test...");

    try {
        // 1. Create a dummy notice in DB to work with
        console.log("📝 Creating test notice in database...");
        const newNotice = await SentNotice.create({
            recipientEmail: 'infringer@copycat-marketplace.com',
            websiteUrl: 'https://copycat-marketplace.com/fake-item-99',
            originalImageUrl: 'http://example.com/orig.jpg',
            copiedImageUrl: 'http://example.com/copy.jpg',
            content: 'Please take this down immediately.',
            status: 'Sent',
            sentAt: new Date()
        });
        console.log(`🟢 Created test notice: ID = ${newNotice.id} | Email = ${newNotice.recipientEmail}`);

        // 2. Fetch notices via GET /api/notices
        console.log(`\n🔍 Fetching notices via GET http://127.0.0.1:${PORT}/api/notices...`);
        const fetchRes = await axios.get(`http://127.0.0.1:${PORT}/api/notices`, {
            headers: { Authorization: `Bearer ${testToken}` }
        });
        console.log("🟢 Response status:", fetchRes.status);
        console.log(`🟢 Returned notices count: ${fetchRes.data.data.length}`);
        
        const found = fetchRes.data.data.find(n => n.id === newNotice.id);
        if (found) {
            console.log("✅ Successfully verified created notice exists in API response.");
        } else {
            console.error("🔴 Created notice not found in API response!");
            process.exit(1);
        }

        // 3. Update status via PUT /api/notices/:id
        console.log(`\n✏️ Updating notice status to 'escalated' via PUT http://127.0.0.1:${PORT}/api/notices/${newNotice.id}...`);
        const updateRes = await axios.put(`http://127.0.0.1:${PORT}/api/notices/${newNotice.id}`, {
            status: 'escalated'
        }, {
            headers: { Authorization: `Bearer ${testToken}` }
        });
        console.log("🟢 Response status:", updateRes.status);
        console.log("🟢 Updated status:", updateRes.data.data.status);
        if (updateRes.data.data.status === 'escalated') {
            console.log("✅ Notice status successfully updated to 'escalated'.");
        } else {
            console.error("🔴 Status update failed!");
            process.exit(1);
        }

        // 4. Resend notice via POST /api/notices/:id/resend
        console.log(`\n✉️ Triggering resend via POST http://127.0.0.1:${PORT}/api/notices/${newNotice.id}/resend...`);
        let resendRes;
        try {
            resendRes = await axios.post(`http://127.0.0.1:${PORT}/api/notices/${newNotice.id}/resend`, {}, {
                headers: { Authorization: `Bearer ${testToken}` }
            });
            console.log("🟢 Response status (success):", resendRes.status);
        } catch (err) {
            if (err.response && err.response.status === 400) {
                console.log("🟢 Response status (expected failure due to sandbox internet restriction): 400");
                console.log("🟢 Error data:", err.response.data);
                resendRes = err.response;
            } else {
                throw err;
            }
        }
        
        // Double check database status
        const noticeAfterResend = await SentNotice.findByPk(newNotice.id);
        console.log("🔍 Checking notice status in DB after resend attempt:", noticeAfterResend.status);
        if (noticeAfterResend.status.startsWith("Failed") || noticeAfterResend.status === "Sent") {
            console.log("✅ Notice status correctly stored in database.");
        } else {
            console.error("🔴 Notice status not updated correctly in database!");
            process.exit(1);
        }

        // 5. Delete notice via DELETE /api/notices/:id
        console.log(`\n🗑️ Deleting notice via DELETE http://127.0.0.1:${PORT}/api/notices/${newNotice.id}...`);
        const deleteRes = await axios.delete(`http://127.0.0.1:${PORT}/api/notices/${newNotice.id}`, {
            headers: { Authorization: `Bearer ${testToken}` }
        });
        console.log("🟢 Response status:", deleteRes.status);
        console.log("🟢 Delete message:", deleteRes.data.message);

        // Double check it's deleted from database
        const doubleCheck = await SentNotice.findByPk(newNotice.id);
        if (!doubleCheck) {
            console.log("✅ Successfully verified notice is deleted from the database.");
        } else {
            console.error("🔴 Notice still exists in database!");
            process.exit(1);
        }

        console.log("\n🎉 All Takedown Flow CRUD checks completed successfully!");
        process.exit(0);

    } catch (error) {
        console.error("🔴 Takedown Flow test failed!");
        if (error.response) {
            console.error("   Error Data:", error.response.data);
            console.error("   Status Code:", error.response.status);
        } else {
            console.error("   Error Message:", error.message);
        }
        process.exit(1);
    }
}

testTakedownFlow();
