import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: true // Allow null for social logins
    },
    google_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    github_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    role: {
        type: DataTypes.STRING, // 'admin', 'client', 'support'
        defaultValue: 'client'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    two_factor_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    two_factor_otp: {
        type: DataTypes.STRING,
        allowNull: true
    },
    two_factor_otp_expires_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    two_factor_otp_attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    subscription_plan: {
        type: DataTypes.STRING,
        defaultValue: 'Free'
    },
    subscription_status: {
        type: DataTypes.STRING,
        defaultValue: 'active' // 'active', 'expired', 'canceled'
    },
    expiry_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_login_at: {
        type: DataTypes.DATE
    },
    remember_me: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    reset_password_otp: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reset_password_otp_expires_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    reset_password_otp_attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeCreate: async (user) => {
            if (user.password_hash && typeof user.password_hash === 'string') {
                const salt = await bcrypt.genSalt(10);
                user.password_hash = await bcrypt.hash(user.password_hash, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password_hash') && user.password_hash && typeof user.password_hash === 'string') {
                const salt = await bcrypt.genSalt(10);
                user.password_hash = await bcrypt.hash(user.password_hash, salt);
            }
        }
    }
});

User.prototype.matchPassword = async function (enteredPassword) {
    if (!enteredPassword || typeof enteredPassword !== 'string' || !this.password_hash || typeof this.password_hash !== 'string') {
        return false;
    }
    try {
        return await bcrypt.compare(enteredPassword, this.password_hash);
    } catch (err) {
        return false;
    }
};

export default User;

