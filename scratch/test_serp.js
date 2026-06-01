import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const SERP_API_KEY = "8b64e58d3cd852a130d72f5baa7198139f50902df2c82d5a235d18862d467cc5";

const testSerpApi = async () => {
    try {
        // Test with a known public image first to see if the key works
        console.log("Testing SerpAPI with public image...");
        const response = await axios.get("https://serpapi.com/search", {
            params: {
                engine: "google_reverse_image",
                image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png",
                api_key: SERP_API_KEY
            }
        });
        console.log("SerpAPI Response Data:", JSON.stringify(response.data, null, 2).substring(0, 500) + "...");
        
        if (response.data.error) {
            console.error("❌ SerpAPI Error:", response.data.error);
        } else {
            console.log("✅ SerpAPI is working with public image.");
        }
    } catch (err) {
        console.error("❌ SerpAPI Call Failed:", err.message);
        if (err.response) console.error("Response Data:", err.response.data);
    }
};

testSerpApi();
