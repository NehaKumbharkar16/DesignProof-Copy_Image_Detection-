import { fetchMatchingWebsites } from '../services/serpApiService.js';
import { findSimilarImagesOnWebsites } from '../services/imageComparisonService.js';
import { Detection, Product, Brand } from '../models/index.js';

/**
 * Orchestrates the full detection flow:
 * 1. SerpAPI Search (Pagination for 100 results)
 * 2. Parallel Crawling & Image Comparison (pHash)
 * 3. Database Storage (PostgreSQL)
 */
export const runDetectionScan = async (req, res) => {
    const { imageUrl, productId } = req.body;

    if (!imageUrl || !productId) {
        return res.status(400).json({ 
            status: 'fail', 
            message: 'imageUrl and productId are required' 
        });
    }

    const startTime = Date.now();

    try {
        // Fetch product to get brand_id
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ status: 'fail', message: 'Product not found' });
        }

        // 1. Fetch 50-100 websites from SerpAPI
        const searchResults = await fetchMatchingWebsites(imageUrl, 100);
        const websitesList = searchResults.links || [];
        
        if (websitesList.length === 0) {
            return res.status(200).json({
                status: 'success',
                results_count: 0,
                data: []
            });
        }

        // 2. Crawl and compare images (similarity > 80% as per service logic)
        const allMatchesRaw = await findSimilarImagesOnWebsites(websitesList, imageUrl);
        
        // Split by 99% threshold (Industry standard for 'Exact' allowing for minor compression diffs)
        const exactMatches = allMatchesRaw.filter(m => m.similarity_score >= 99);
        const similarMatches = allMatchesRaw.filter(m => m.similarity_score < 99);

        // 3. Save to PostgreSQL
        console.log(`[Node Gateway] Storing ${exactMatches.length + similarMatches.length} detections for product ID: ${productId}`);
        
        const allMatches = [...exactMatches, ...similarMatches];
        const savedDetections = [];

        for (const match of allMatches) {
            const isExact = match.similarity_score === 100;
            const detection = await Detection.create({
                product_id: productId,
                brand_id: product.brand_id,
                infringing_url: match.website_url,
                infringing_image_url: match.copied_image_url,
                similarity_score: match.similarity_score,
                confidence_tag: isExact ? 'direct_copy' : 'modified_copy',
                client_status: 'pending',
                detected_platform: 'web_discovery'
            });
            savedDetections.push(detection);
        }

        const duration = (Date.now() - startTime) / 1000;
        console.log(`✨ Scan completed in ${duration}s. Found ${allMatches.length} matches.`);

        // 4. Return the final filtered list
        return res.status(200).json({
            status: 'success',
            results_count: savedDetections.length,
            scan_duration_seconds: duration,
            data: savedDetections.map(d => ({
                id: d.id,
                website: d.infringing_url,
                similarity: d.similarity_score,
                image: d.infringing_image_url,
                status: d.client_status
            }))
        });

    } catch (error) {
        console.error("❌ Detection Feature Error:", error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to complete detection scan',
            details: error.message
        });
    }
};

/**
 * Fetches all detections for the authenticated user's products.
 */
export const getDetections = async (req, res) => {
    try {
        const brand = await Brand.findOne({ where: { owner_id: req.user.id } });
        if (!brand) return res.status(200).json({ status: 'success', data: [] });

        const products = await Product.findAll({ where: { brand_id: brand.id } });
        const productIds = products.map(p => p.id);

        const detections = await Detection.findAll({
            where: { product_id: productIds },
            include: [{ model: Product, as: 'product' }],
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            status: 'success',
            results_count: detections.length,
            data: detections.map(d => ({
                id: d.id,
                website: d.infringing_url,
                image: d.infringing_image_url,
                similarity: d.similarity_score,
                status: d.client_status,
                contact_email: d.contact_email,
                productName: d.product?.name || 'Unknown Product',
                dateFound: d.created_at ? d.created_at.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                createdAt: d.created_at
            }))
        });
    } catch (error) {
        console.error("❌ Get Detections Error:", error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch detections',
            details: error.message
        });
    }
};
