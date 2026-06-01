import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';

dotenv.config();

const SERP_API_KEY = process.env.SERP_API_KEY || "1b95936cad36a631f65641107670464ada508c9632be71250421689eeb382cbc";

/**
 * Hosts an image publicly via Litterbox (Catbox) or fallbacks so SerpAPI can access it.
 */
export const uploadToPublicHost = async (fileBuffer, filename) => {
    let attempts = 0;
    while (attempts < 2) {
        try {
            const url = await _uploadToPublicHostInternal(fileBuffer, filename);
            if (url) return url;
        } catch (e) {}
        attempts++;
        if (attempts < 2) await new Promise(r => setTimeout(r, 1000));
    }
    return null;
};

const _uploadToPublicHostInternal = async (fileBuffer, filename) => {
    if (typeof fileBuffer === 'string' && (fileBuffer.startsWith('http') || fileBuffer.startsWith('https'))) {
        console.log(`[SerpAPI] Using already public URL: ${fileBuffer}`);
        return fileBuffer;
    }

    // Try Litterbox (Catbox)
    console.log(`[SerpAPI] Hosting image on Litterbox (Catbox)...`);
    try {
        const formData = new FormData();
        formData.append('reqtype', 'fileupload');
        formData.append('time', '12h'); 
        formData.append('fileToUpload', fileBuffer, { filename });

        const response = await axios.post('https://litterbox.catbox.moe/objects.php', formData, {
            headers: { ...formData.getHeaders() },
            timeout: 30000 
        });

        if (response.status === 200 && typeof response.data === 'string' && response.data.startsWith('http')) {
            console.log(`✅ [SerpAPI] Litterbox URL: ${response.data.trim()}`);
            return response.data.trim();
        }
    } catch (err) {
        console.warn(`⚠️ [SerpAPI] Litterbox failed: ${err.message}`);
    }

    // Fallback 2: tmpfiles.org
    try {
        console.log(`[SerpAPI] Trying fallback hosting 2 (tmpfiles)...`);
        const formData = new FormData();
        formData.append('file', fileBuffer, { filename });

        const response = await axios.post('https://tmpfiles.org/api/v1/upload', formData, {
            headers: { ...formData.getHeaders() },
            timeout: 30000
        });

        if (response.status === 200 && response.data?.data?.url) {
            let publicUrl = response.data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
            if (!publicUrl.startsWith('https')) publicUrl = publicUrl.replace('http', 'https');
            console.log(`✅ [SerpAPI] Tmpfiles URL: ${publicUrl}`);
            return publicUrl;
        }
    } catch (error) {
        console.warn(`⚠️ [SerpAPI] Tmpfiles failed: ${error.message}`);
    }

    // Fallback 3: file.io (14 day retention)
    try {
        console.log(`[SerpAPI] Trying fallback hosting 3 (file.io)...`);
        const formData = new FormData();
        formData.append('file', fileBuffer, { filename });

        const response = await axios.post('https://file.io/?expires=1d', formData, {
            headers: { ...formData.getHeaders() },
            timeout: 20000
        });

        if (response.status === 200 && response.data?.link) {
            console.log(`✅ [SerpAPI] File.io URL: ${response.data.link}`);
            return response.data.link;
        }
    } catch (error) {
         console.warn(`⚠️ [SerpAPI] File.io failed: ${error.message}`);
    }

    return null;
};

/**
 * Fetches matching website links from SerpAPI using Google Reverse Image Search.
 */
export const fetchMatchingWebsites = async (imageSource, filenameOrCount, targetCount = 100) => {
    // Handle overloaded arguments from detectionController.js
    let filename = filenameOrCount;
    if (typeof filenameOrCount === 'number') {
        targetCount = filenameOrCount;
        filename = 'search_image.jpg';
    }

    let allLinks = [];
    
    // Step 1: Get Public URL (for DB/UI, not for search anymore)
    console.log(`[SerpAPI] Preparing search for: ${filename}`);
    let publicImageUrl = null;
    try {
        publicImageUrl = await uploadToPublicHost(imageSource, filename);
    } catch (e) {
        console.warn(`⚠️ [SerpAPI] Public hosting failed, proceeding with direct upload to Search...`);
    }

    try {
        // Step 2: Call Google Reverse Image with DIRECT UPLOAD (POST)
        let reverseLinks = [];
        let allMatchingPages = [];
        
        console.log(`📡 [SerpAPI] Calling google_reverse_image via MULTIPART POST...`);
        
        const firstPageFormData = new FormData();
        firstPageFormData.append('file', imageSource, { filename });

        // Use query params for engine and key, and body for file, as SerpAPI often requires this mix
        const revResponse = await axios.post("https://serpapi.com/search", firstPageFormData, { 
            params: {
                engine: 'google_reverse_image',
                api_key: SERP_API_KEY
            },
            headers: { ...firstPageFormData.getHeaders() },
            timeout: 60000 
        });

        if (revResponse.data.error) {
            console.error(`❌ [SerpAPI] Engine Error: ${revResponse.data.error}`);
        } else {
            const pageResults = revResponse.data.image_results || [];
            const matchingPages = revResponse.data.pages_with_matching_images || [];
            reverseLinks.push(...pageResults);
            allMatchingPages.push(...matchingPages);
            console.log(`📡 [SerpAPI] Reverse Image returned ${pageResults.length} raw items and ${matchingPages.length} exact matches.`);
        }
        
        // Step 3: Call Google Lens (Visual Matches) via DIRECT UPLOAD
        const lensResults = [];
        try {
            console.log(`📡 [SerpAPI] Calling google_lens via MULTIPART POST...`);
            const lensFormData = new FormData();
            lensFormData.append('file', imageSource, { filename });

            const lensResponse = await axios.post("https://serpapi.com/search", lensFormData, { 
                params: {
                    engine: 'google_lens',
                    api_key: SERP_API_KEY
                },
                headers: { ...lensFormData.getHeaders() },
                timeout: 60000 
            });
            
            if (lensResponse.data && !lensResponse.data.error) {
                const res = lensResponse.data.visual_matches || [];
                lensResults.push(...res);
                console.log(`✅ [SerpAPI] Found ${res.length} matches from Lens engine.`);
            } else if (lensResponse.data?.error) {
                console.error(`❌ [SerpAPI] Lens Error: ${lensResponse.data.error}`);
            }
        } catch (lensErr) {
            console.warn(`⚠️ [SerpAPI] Lens call failed: ${lensErr.message}`);
        }

        // Requirement: Filter out random noise like social media, video sites, and generic search engines
        const noiseDomains = [
            'facebook.com', 'youtube.com', 'instagram.com', 'pinterest.com', 
            'twitter.com', 'x.com', 'linkedin.com', 'tiktok.com', 
            'google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com',
            'yandex.com', 'gravatar.com', 'pixabay.com', 'unsplash.com', 
            'pexels.com', 'wikimedia.org', 'shutterstock.com', 'istockphoto.com'
        ];

        // 1. Process pages_with_matching_images (High priority - these contain the exact image)
        const exactPotential = (allMatchingPages || []).map(item => ({
            title: item.title,
            link: item.link,
            thumbnail: item.thumbnail || item.thumbnail_url,
            is_exact: true,
            source_type: 'google_exact_page'
        }));

        // 2. Process reverse_image image_results (Medium priority - visually similar)
        const visualPotential = [
            ...(reverseLinks || []),
            ...(lensResults || [])
        ].map(item => ({
            title: item.title,
            link: item.link,
            thumbnail: item.thumbnail || item.thumbnail_url,
            is_exact: false,
            source_type: 'visual_match'
        }));

        const combinedResults = [...exactPotential, ...visualPotential]
            .filter(item => {
                if (!item.link) return false;
                try {
                    const domain = new URL(item.link).hostname.toLowerCase();
                    // Block noise domains and known stock/generic sites that are typically not helpful for takedowns
                    return !noiseDomains.some(noise => domain.includes(noise));
                } catch (err) { return false; }
            });

        // Use a map to keep only unique links, but if we encounter an exact match potential, prefer it
        const linkMap = new Map();
        for (const item of combinedResults) {
            const existing = linkMap.get(item.link);
            if (!existing || (item.is_exact && !existing.is_exact)) {
                linkMap.set(item.link, item);
            }
        }
        
        const uniqueLinks = Array.from(linkMap.values());
        
        // Final sort: Exact potentials first
        uniqueLinks.sort((a, b) => (b.is_exact === a.is_exact ? 0 : b.is_exact ? 1 : -1));

        console.log(`✨ [SerpAPI] Filtered results: ${uniqueLinks.length} unique links retained for crawling.`);

        return {
            links: uniqueLinks.slice(0, targetCount),
            publicImageUrl
        };
    } catch (error) {
        console.error("❌ [SerpAPI] Critical Integration Error:", error.response?.data || error.message);
        throw error;
    }
};
