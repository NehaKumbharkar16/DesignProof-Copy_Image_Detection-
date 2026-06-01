import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ContactEmail = sequelize.define('ContactEmail', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    domain: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sourcePage: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'source_page'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    }
}, {
    tableName: 'contact_emails',
    timestamps: false
});

export default ContactEmail;
