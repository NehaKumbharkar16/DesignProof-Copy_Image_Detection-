import User from './User.js';
import Brand from './Brand.js';
import Product from './Product.js';
import Detection from './Detection.js';
import Takedown from './Takedown.js';
import Subscription from './Subscription.js';
import AuditLog from './AuditLog.js';
import SentNotice from './SentNotice.js';
import ContactEmail from './ContactEmail.js';
import Plan from './Plan.js';
import Payment from './Payment.js';
import OtpCode from './OtpCode.js';

// Define Associations
User.hasMany(Brand, { foreignKey: 'owner_id', as: 'brands' });
Brand.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products' });
Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

Brand.hasMany(Detection, { foreignKey: 'brand_id', as: 'detections' });
Detection.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

Product.hasMany(Detection, { foreignKey: 'product_id', as: 'detections', onDelete: 'CASCADE', hooks: true });
Detection.belongsTo(Product, { foreignKey: 'product_id', as: 'product', onDelete: 'CASCADE' });

Detection.hasOne(Takedown, { foreignKey: 'detected_match_id', as: 'takedown' });
Takedown.belongsTo(Detection, { foreignKey: 'detected_match_id', as: 'detection' });

Brand.hasOne(Subscription, { foreignKey: 'brand_id', as: 'subscription' });
Subscription.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Brand.hasMany(AuditLog, { foreignKey: 'brand_id', as: 'auditLogList' });
AuditLog.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brandObj' });

User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export {
    User,
    Brand,
    Product,
    Detection,
    Takedown,
    Subscription,
    AuditLog,
    SentNotice,
    ContactEmail,
    Plan,
    Payment,
    OtpCode
};
