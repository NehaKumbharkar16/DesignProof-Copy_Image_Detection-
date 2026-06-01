import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Subscription = sequelize.define('Subscription', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    brand_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true
    },
    plan_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'active'
    },
    billing_period: {
        type: DataTypes.STRING,
        defaultValue: 'monthly'
    },
    renews_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    started_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'brand_subscriptions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Subscription;
