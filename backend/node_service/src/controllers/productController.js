import { Product, Brand, Detection } from '../models/index.js';

/**
 * Get all scanned products for the authenticated user's brand.
 */
export const getProducts = async (req, res) => {
    try {
        const targetUser = req.user || { id: '00000000-0000-0000-0000-000000000000' };
        
        const brand = await Brand.findOne({ where: { owner_id: targetUser.id } });
        if (!brand) {
            return res.status(200).json({
                status: 'success',
                data: []
            });
        }

        const products = await Product.findAll({
            where: { brand_id: brand.id },
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            status: 'success',
            results: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch products',
            details: error.message
        });
    }
};

/**
 * Delete a product by ID. Cascade deletion deletes all associated detected matches.
 */
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const targetUser = req.user || { id: '00000000-0000-0000-0000-000000000000' };

        const brand = await Brand.findOne({ where: { owner_id: targetUser.id } });
        if (!brand) {
            return res.status(401).json({
                status: 'fail',
                message: 'Unauthorized action'
            });
        }

        const product = await Product.findOne({
            where: { id, brand_id: brand.id }
        });

        if (!product) {
            return res.status(404).json({
                status: 'fail',
                message: 'Product not found'
            });
        }

        await product.destroy();

        return res.status(200).json({
            status: 'success',
            message: 'Scanned image and all associated links successfully deleted.'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to delete product',
            details: error.message
        });
    }
};
