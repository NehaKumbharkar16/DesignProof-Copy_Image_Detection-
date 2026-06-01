import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const SentNotice = sequelize.define('SentNotice', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    recipientEmail: {
        type: DataTypes.STRING,
        allowNull: false
    },
    websiteUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    originalImageUrl: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    copiedImageUrl: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Sent'
    },
    sentAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    created_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
}, {
    tableName: 'sent_notices',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default SentNotice;
