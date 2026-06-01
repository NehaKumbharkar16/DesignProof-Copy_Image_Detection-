import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Detection = sequelize.define('Detection', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    product_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    brand_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    infringing_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    infringing_image_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    similarity_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    match_type: {
        type: DataTypes.STRING,
        defaultValue: 'similar_match'
    },
    confidence_tag: {
        type: DataTypes.STRING,
        defaultValue: 'direct_copy'
    },
    client_status: {
        type: DataTypes.STRING,
        defaultValue: 'pending'
    },
    detected_platform: {
        type: DataTypes.STRING,
        defaultValue: 'web_discovery'
    },
    contact_email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    created_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    first_notice_sent_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    second_notice_sent_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    deadline_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    enforcement_status: {
        type: DataTypes.STRING,
        defaultValue: 'detected'
    },
    is_removed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    last_checked_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'detected_matches',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Detection;
