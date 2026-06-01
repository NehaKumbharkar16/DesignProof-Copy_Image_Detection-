import dotenv from 'dotenv';
dotenv.config();

import { fetchMatchingWebsites } from './src/services/serpApiService.js';

async function test() {
    try {
        const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png";
        console.log("Testing with URL:", imageUrl);
        const results = await fetchMatchingWebsites(imageUrl, 5);
        console.log("Results found:", results.links.length);
        console.log("URLs:", results.links.map(l => l.link).slice(0, 3));
    } catch (e) {
        console.error("Error:", e.message);
        if (e.response && e.response.data) {
            console.error("Axios details:", e.response.data);
        }
    }
}

test();
