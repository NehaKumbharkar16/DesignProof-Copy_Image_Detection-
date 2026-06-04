import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Brand = sequelize.define('Brand', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    owner_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    website_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    scan_type: {
        type: DataTypes.STRING,
        defaultValue: 'continuous'
    },
    scan_frequency: {
        type: DataTypes.STRING,
        defaultValue: 'daily'
    },
    monitor_d2c: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    monitor_shopify: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    monitor_marketplaces: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    monitor_google_images: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    monitor_social_media: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'brands',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Brand;
