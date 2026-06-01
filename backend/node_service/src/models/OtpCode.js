import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const OtpCode = sequelize.define('OtpCode', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    otp_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    purpose: {
        type: DataTypes.STRING, // '2fa', 'reset_password', 'email_verification'
        allowNull: false
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
}, {
    tableName: 'otp_codes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default OtpCode;
