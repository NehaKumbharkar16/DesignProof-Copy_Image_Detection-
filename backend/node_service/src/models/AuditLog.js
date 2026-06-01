import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    brand_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    entity_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    entity_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    ip_address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    created_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
}, {
    tableName: 'audit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

export default AuditLog;
