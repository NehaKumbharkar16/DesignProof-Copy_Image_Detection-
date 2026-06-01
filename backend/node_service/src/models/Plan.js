import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Plan = sequelize.define('Plan', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    plan_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    duration: {
        type: DataTypes.STRING,
        allowNull: false // 'monthly', 'annually'
    },
    features: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'plans',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Plan;
