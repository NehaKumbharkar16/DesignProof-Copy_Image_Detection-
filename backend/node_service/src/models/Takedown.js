import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Takedown = sequelize.define('Takedown', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    detected_match_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true
    },
    brand_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    product_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    notice_status: {
        type: DataTypes.STRING,
        defaultValue: 'pending'
    },
    notice_content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    sent_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    deadline_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    target_url: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'takedown_notices',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Takedown;
