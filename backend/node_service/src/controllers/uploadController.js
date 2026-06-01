import { uploadToPythonService, analyzeSimilarities } from '../services/pythonService.js';
import { fetchMatchingWebsites, uploadToPublicHost } from '../services/serpApiService.js';
import { User, Brand, Product, Detection, SentNotice } from '../models/index.js';
import { crawlWebsiteForEmails } from '../services/crawlerService.js';
import crypto from 'crypto';
import pLimit from 'p-limit';

const limit = pLimit(10); // 10 concurrent crawls as per task

/**
 * Handle image upload, discovery, analysis, and database storage.
 */
export const handleImageUpload = async (req, res) => {
    console.log(`\n🚀 [Node Gateway] Starting discovery for ${req.file?.originalname}...`);
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const startTime = Date.now();
        console.log(`[Node Gateway] Delegating full discovery & analysis to Python AI service...`);

        const pythonResponse = await uploadToPythonService(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        if (pythonResponse.error) {
            console.error(`[ERR] [NODE] Python service returned error:`, pythonResponse.error);
            return res.status(500).json({ 
                error: `Discovery Engine Error: ${pythonResponse.error}`,
                details: pythonResponse.details || 'Check python_service logs'
            });
        }

        // Process Python response
        const publicImageUrl = pythonResponse.uploaded_image;
        const verifiedMatches = pythonResponse.matching_websites || [];
        
        // Use the categorization already provided by the Python service in our previous update
        const exactMatches = pythonResponse.exactMatches || [];
        const similarMatches = pythonResponse.similarMatches || [];

        const finalResponse = {
            uploaded_image: publicImageUrl,
            exactMatches,
            similarMatches,
            matching_websites: verifiedMatches, 
            counts: pythonResponse.counts || { exact: exactMatches.length, similar: similarMatches.length },
            scan_duration: `${((Date.now() - startTime) / 1000).toFixed(1)}s`
        };

        // 4. Save to Database - Hardcoded for Dev if req.user is missing
        const targetUser = req.user || { id: '00000000-0000-0000-0000-000000000000', email: 'dev-guest@designproof.ai' };
        console.log(`[Node Gateway] Target DB User: ${targetUser.email}. Attempting storage...`);

        try {
            // Find or create user first (to satisfy FK constraint)
            let user = await User.findByPk(targetUser.id);
            if (!user) {
                console.log(`[Node Gateway] Dev-Mode: Creating mock user to satisfy FK...`);
                user = await User.create({
                    id: targetUser.id,
                    first_name: "Dev",
                    last_name: "User",
                    email: targetUser.email || "dev@designproof.ai",
                    password_hash: "mock_password_not_for_login"
                });
            }

            // Find or create brand for this user
            let brand = await Brand.findOne({ where: { owner_id: targetUser.id } });
            if (!brand) {
                console.log(`[Node Gateway] Creating default brand...`);
                brand = await Brand.create({ 
                    id: crypto.randomUUID(), 
                    owner_id: targetUser.id, 
                    name: "Default Dev Brand"
                });
            }
            
            console.log(`[Node Gateway] Creating Product entry...`);
            const product = await Product.create({
                id: crypto.randomUUID(),
                brand_id: brand.id,
                name: req.file.originalname,
                primary_image_url: publicImageUrl,
                priority: 'high',
                protection_active: true
            });

            console.log(`[Node Gateway] Storing ${verifiedMatches.length} detection matches...`);
            for (const match of verifiedMatches) {
                await Detection.create({
                    id: crypto.randomUUID(),
                    product_id: product.id,
                    brand_id: brand.id,
                    infringing_url: match.url || match.link,
                    infringing_image_url: match.copied_image_url || match.thumbnail,
                    similarity_score: match.similarity_score || 85.0,
                    match_type: match.match_type === "Exact Match" ? "exact_match" : "similar_match",
                    detected_platform: 'web_discovery',
                    confidence_tag: match.match_type === "Exact Match" ? "direct_copy" : "modified_copy",
                    client_status: 'pending',
                    contact_email: match.emails && match.emails.length > 0 ? match.emails[0].email : null
                });
            }
            console.log(`[OK] [NODE] DB storage success for product: ${product.name}`);
        } catch (dbErr) {
            console.error("[ERR] [NODE] DB STORAGE FAILURE:", dbErr.message, dbErr.stack);
        }

        console.log(`[OK] [NODE] Discovery complete. Found ${exactMatches.length} exact duplicates.`);
        return res.status(200).json(finalResponse);

    } catch (error) {
        console.error(`[ERR] [NODE] Critical Error handling upload:`, error.message);
        
        let errorMessage = error.message || 'Internal process failure';
        let errorDetails = null;

        if (error.response && error.response.data) {
            errorDetails = error.response.data;
            if (error.response.data.error) {
                errorMessage = `Discovery Engine: ${error.response.data.error}`;
            }
        }

        return res.status(500).json({ 
            error: errorMessage,
            details: errorDetails,
            interrupted: true 
        });
    }
};

