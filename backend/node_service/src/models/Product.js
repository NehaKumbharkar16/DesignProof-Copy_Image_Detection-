import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    brand_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: true
    },
    primary_image_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    public_search_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phash_code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    priority: {
        type: DataTypes.STRING,
        defaultValue: 'medium'
    },
    protection_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Product;
