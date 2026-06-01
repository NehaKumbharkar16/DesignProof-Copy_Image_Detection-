import axios from 'axios';
import * as cheerio from 'cheerio';
import { imageHash } from 'image-hash';
import pLimit from 'p-limit';

const limit = pLimit(10); // Process 10 websites in parallel

/**
 * Calculates pHash of an image from a URL or buffer.
 */
const getPHash = (imageSource) => {
    return new Promise((resolve, reject) => {
        imageHash(imageSource, 16, true, (error, data) => {
            if (error) return reject(error);
            resolve(data);
        });
    });
};

/**
 * Compares two pHashes and returns a similarity percentage.
 * pHash is typically a hex string. Hamming distance is used for comparison.
 */
const compareHashes = (hash1, hash2) => {
    let distance = 0;
    // Assuming hashes are same length
    for (let i = 0; i < hash1.length; i++) {
        const hex1 = parseInt(hash1[i], 16).toString(2).padStart(4, '0');
        const hex2 = parseInt(hash2[i], 16).toString(2).padStart(4, '0');
        for (let j = 0; j < 4; j++) {
            if (hex1[j] !== hex2[j]) distance++;
        }
    }
    // Max distance for 16-bit hash (each hex char is 4 bits, so 16*4 = 64 bits)
    const maxDistance = 64; 
    const similarity = ((maxDistance - distance) / maxDistance) * 100;
    return similarity;
};

/**
 * Crawls a single website and finds images similar to the original.
 */
const analyzeWebsite = async (link, originalHash, originalImageUrl) => {
    try {
        console.log(`🌐 Crawling: ${link}`);
        const response = await axios.get(link, { 
            timeout: 5000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        
        const $ = cheerio.load(response.data);
        const images = [];
        
        $('img').each((i, el) => {
            let src = $(el).attr('src');
            if (src) {
                // Convert relative to absolute
                if (!src.startsWith('http')) {
                    try {
                        const url = new URL(link);
                        src = new URL(src, url.origin).href;
                    } catch (e) {
                        return;
                    }
                }
                images.push(src);
            }
        });

        // Filter unique images to avoid redundant hashing
        const uniqueImages = [...new Set(images)];
        
        // Find the best match among images on the page
        let bestMatch = { similarity: 0, image: null };

        for (const imgUrl of uniqueImages.slice(0, 15)) { // Limit per page for performance
            try {
                const currentHash = await getPHash(imgUrl);
                const similarity = compareHashes(originalHash, currentHash);
                
                if (similarity > bestMatch.similarity) {
                    bestMatch = { similarity, image: imgUrl };
                }
                
                if (similarity > 95) break; // Found an exact enough match
            } catch (e) {
                // Skip broken images
            }
        }

        if (bestMatch.similarity >= 80) {
            return {
                website_url: link,
                similarity_score: Math.round(bestMatch.similarity),
                copied_image_url: bestMatch.image
            };
        }
        
        return null;
    } catch (error) {
        // console.error(`⚠️ Failed to crawl ${link}:`, error.message);
        return null;
    }
};

/**
 * Orchestrates the crawling and comparison of multiple websites.
 */
export const findSimilarImagesOnWebsites = async (links, originalImageUrl) => {
    console.log(`🚀 Starting analysis of ${links.length} websites...`);
    
    try {
        const originalHash = await getPHash(originalImageUrl);
        
        const tasks = links.map(item => 
            limit(() => analyzeWebsite(item.link, originalHash, originalImageUrl))
        );
        
        const results = await Promise.all(tasks);
        
        // Filter out nulls (where no match > 90% was found or crawl failed)
        return results.filter(res => res !== null);
    } catch (error) {
        console.error("❌ Error in image comparison workflow:", error.message);
        throw error;
    }
};
