"""
DesignProof Database Models (SQLAlchemy ORM)
Python backend models for PostgreSQL database
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Numeric, JSONB, Date, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid
import enum

Base = declarative_base()

# ============================================================================
# ENUMS
# ============================================================================

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    CLIENT = "client"
    SUPPORT = "support"

class VerificationMethod(str, enum.Enum):
    META_TAG = "meta_tag"
    DNS = "dns"
    FILE = "file"

class SubscriptionStatus(str, enum.Enum):
    FREE = "free"
    ACTIVE = "active"
    PAUSED = "paused"
    EXPIRED = "expired"

class ProductPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ScanFrequency(str, enum.Enum):
    MANUAL = "manual"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class ConfidenceTag(str, enum.Enum):
    DIRECT_COPY = "direct_copy"
    MODIFIED_COPY = "modified_copy"
    INSPIRED = "inspired"

class MatchStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    IGNORED = "ignored"
    IGNORED_SIMILAR = "ignored_similar"

class TakedownStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    AWAITING_RESPONSE = "awaiting_response"
    ESCALATED = "escalated"
    RESOLVED = "resolved"
    IGNORED = "ignored"

class ComplianceStatus(str, enum.Enum):
    PENDING = "pending"
    REMOVED = "removed"
    REPLACED = "replaced"
    IGNORED = "ignored"
    ESCALATED = "escalated"

class EscalationType(str, enum.Enum):
    NONE = "none"
    HOSTING = "hosting"
    PAYMENT_GATEWAY = "payment_gateway"
    AD_PLATFORM = "ad_platform"

class BillingPeriod(str, enum.Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"

class InvoiceStatus(str, enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELED = "canceled"

class PaymentMethod(str, enum.Enum):
    CREDIT_CARD = "credit_card"
    BANK_TRANSFER = "bank_transfer"
    PAYPAL = "paypal"

class AlertType(str, enum.Enum):
    NEW_MATCH_DETECTED = "new_match_detected"
    TAKEDOWN_SENT = "takedown_sent"
    REMOVAL_CONFIRMED = "removal_confirmed"
    ESCALATION_NEEDED = "escalation_needed"

class AlertSeverity(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"

class AlertPlatform(str, enum.Enum):
    SHOPIFY = "shopify"
    WOOCOMMERCE = "woocommerce"
    ETSY = "etsy"
    D2C_WEBSITE = "d2c_website"

# ============================================================================
# USER & AUTHENTICATION
# ============================================================================

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    phone = Column(String(20))
    role = Column(Enum(UserRole), default=UserRole.CLIENT, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    email_verified_at = Column(DateTime)
    two_factor_enabled = Column(Boolean, default=False)
    last_login_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    brands = relationship("Brand", back_populates="owner", foreign_keys="Brand.owner_id")
    audit_logs = relationship("AuditLog", back_populates="user", foreign_keys="AuditLog.user_id")
    takedown_approvals = relationship("TakedownNotice", foreign_keys="TakedownNotice.escalation_approved_by_user_id")
    approved_matches = relationship("DetectedMatch", foreign_keys="DetectedMatch.approved_by_user_id")
    alerts = relationship("SystemAlert", foreign_keys="SystemAlert.user_id")
    abuse_flag_creator = relationship("AbuseFlag", foreign_keys="AbuseFlag.flagged_by_user_id")

# ============================================================================
# BRAND & ORGANIZATION
# ============================================================================

class Brand(Base):
    __tablename__ = "brands"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    website_url = Column(String(500))
    country = Column(String(100))
    industry = Column(String(100))
    logo_url = Column(String(500))
    description = Column(Text)
    business_email = Column(String(255))
    phone = Column(String(20))
    
    # Verification
    is_verified = Column(Boolean, default=False)
    verification_method = Column(Enum(VerificationMethod))
    verification_token = Column(String(255), unique=True)
    verification_completed_at = Column(DateTime)
    
    # Legal
    authorization_accepted = Column(Boolean, default=False)
    terms_accepted = Column(Boolean, default=False)
    authorized_at = Column(DateTime)
    
    # Settings
    is_active = Column(Boolean, default=True)
    subscription_status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.FREE)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="brands", foreign_keys=[owner_id])
    products = relationship("Product", back_populates="brand", cascade="all, delete-orphan")
    monitoring_settings = relationship("MonitoringSettings", back_populates="brand", uselist=False, cascade="all, delete-orphan")
    detected_matches = relationship("DetectedMatch", back_populates="brand", cascade="all, delete-orphan")
    takedown_notices = relationship("TakedownNotice", back_populates="brand", cascade="all, delete-orphan")
    compliance_tracking = relationship("ComplianceTracking", back_populates="brand", cascade="all, delete-orphan")
    whitelisted_domains = relationship("WhitelistedDomain", back_populates="brand", cascade="all, delete-orphan")
    blacklisted_domains = relationship("BlacklistedDomain", back_populates="brand", cascade="all, delete-orphan")
    subscription = relationship("BrandSubscription", back_populates="brand", uselist=False, cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="brand", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="brand", foreign_keys="AuditLog.brand_id", cascade="all, delete-orphan")
    platform_integrations = relationship("PlatformIntegration", back_populates="brand", cascade="all, delete-orphan")
    system_alerts = relationship("SystemAlert", back_populates="brand", foreign_keys="SystemAlert.brand_id", cascade="all, delete-orphan")
    abuse_flags = relationship("AbuseFlag", back_populates="brand", cascade="all, delete-orphan")
    usage_tracking = relationship("UsageTracking", back_populates="brand", cascade="all, delete-orphan")

# ============================================================================
# PRODUCTS & DESIGNS
# ============================================================================

class Product(Base):
    __tablename__ = "products"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False)
    name = Column(String(255), nullable=False)
    sku = Column(String(100))
    category = Column(String(100))
    collection = Column(String(100))
    priority = Column(Enum(ProductPriority), default=ProductPriority.MEDIUM)
    description = Column(Text)
    
    # Image & Visual Data
    primary_image_url = Column(String(500))
    image_fingerprint = Column(String(255))
    image_hash = Column(String(255))
    
    # Product URLs
    product_url = Column(String(500))
    
    # Status
    protection_active = Column(Boolean, default=True)
    
    # Tracking
    original_created_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    brand = relationship("Brand", back_populates="products")
    product_images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    detected_matches = relationship("DetectedMatch", back_populates="product", cascade="all, delete-orphan")
    takedown_notices = relationship("TakedownNotice", back_populates="product", cascade="all, delete-orphan")

class ProductImage(Base):
    __tablename__ = "product_images"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    image_url = Column(String(500), nullable=False)
    image_fingerprint = Column(String(255))
    image_hash = Column(String(255))
    file_size = Column(Integer)
    dimensions = Column(String(50))
    is_primary = Column(Boolean, default=False)
    upload_order = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    product = relationship("Product", back_populates="product_images")

# ============================================================================
# MONITORING SETTINGS
# ============================================================================

class MonitoringSettings(Base):
    __tablename__ = "monitoring_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False, unique=True)
    
    # Scan Settings
    scan_frequency = Column(Enum(ScanFrequency), default=ScanFrequency.WEEKLY)
    is_continuous_monitoring = Column(Boolean, default=True)
    
    # Sources to Monitor
    scan_d2c_websites = Column(Boolean, default=True)
    scan_shopify_stores = Column(Boolean, default=True)
    scan_google_images = Column(Boolean, default=True)
    scan_social_ads = Column(Boolean, default=True)
    scan_marketplaces = Column(Boolean, default=False)
    
    # Advanced Options
    similarity_threshold = Column(Integer, default=70)
    detect_color_variations = Column(Boolean, default=True)
    detect_background_swaps = Column(Boolean, default=True)
    detect_minor_edits = Column(Boolean, default=True)
    
    last_scan_at = Column(DateTime)
    next_scheduled_scan = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    brand = relationship("Brand", back_populates="monitoring_settings")

# ============================================================================
# DETECTED COPIES / MATCHES
# ============================================================================

class DetectedMatch(Base):
    __tablename__ = "detected_matches"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False)
    
    # Infringing Content Details
    infringing_url = Column(String(500), nullable=False)
    infringing_image_url = Column(String(500))
    detected_platform = Column(String(100))
    
    # AI Detection Results
    similarity_score = Column(Numeric(5, 2), nullable=False)
    confidence_tag = Column(Enum(ConfidenceTag), nullable=False)
    ai_analysis_json = Column(JSONB)
    
    # Additional Details
    detected_product_name = Column(String(255))
    detected_seller_name = Column(String(255))
    detected_seller_email = Column(String(255))
    
    # Approval Status
    client_status = Column(Enum(MatchStatus), default=MatchStatus.PENDING)
    approved_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    approved_at = Column(DateTime)
    
    # Actions
    is_authorized_reseller = Column(Boolean, default=False)
    is_blacklisted = Column(Boolean, default=False)
    
    # Screenshots & Proof
    screenshot_url = Column(String(500))
    screenshot_taken_at = Column(DateTime)
    
    detected_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    product = relationship("Product", back_populates="detected_matches")
    brand = relationship("Brand", back_populates="detected_matches")
    approved_by = relationship("User", foreign_keys=[approved_by_user_id])
    takedown_notice = relationship("TakedownNotice", back_populates="detected_match", uselist=False, cascade="all, delete-orphan")

# ============================================================================
# TAKEDOWN NOTICES
# ============================================================================

class TakedownNotice(Base):
    __tablename__ = "takedown_notices"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    detected_match_id = Column(UUID(as_uuid=True), ForeignKey("detected_matches.id"), nullable=False, unique=True)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    
    # Notice Details
    notice_status = Column(Enum(TakedownStatus), default=TakedownStatus.PENDING)
    sent_from_email = Column(String(255))
    sent_to_email = Column(String(255))
    
    # Target Information
    target_url = Column(String(500))
    target_platform = Column(String(100))
    target_domain = Column(String(255))
    target_hosting_provider = Column(String(255))
    target_payment_gateway = Column(String(255))
    target_ad_platform = Column(String(100))
    
    # Notice Content
    notice_content = Column(Text)
    notice_template_id = Column(UUID(as_uuid=True))
    
    # Shopify Specific
    is_shopify_store = Column(Boolean, default=False)
    shopify_complaint_id = Column(String(255))
    shopify_complaint_status = Column(String(100))
    
    # Escalation
    escalation_type = Column(Enum(EscalationType), default=EscalationType.NONE)
    is_escalated = Column(Boolean, default=False)
    escalation_approved = Column(Boolean, default=False)
    escalation_approved_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    escalation_approved_at = Column(DateTime)
    
    # Deadline
    deadline_days = Column(Integer, default=3)
    deadline_at = Column(DateTime)
    
    # Responses
    response_received = Column(Boolean, default=False)
    response_received_at = Column(DateTime)
    response_content = Column(Text)
    
    # Tracking
    reminders_sent = Column(Integer, default=0)
    last_reminder_sent_at = Column(DateTime)
    final_reminder_sent = Column(Boolean, default=False)
    
    sent_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    detected_match = relationship("DetectedMatch", back_populates="takedown_notice")
    brand = relationship("Brand", back_populates="takedown_notices")
    product = relationship("Product", back_populates="takedown_notices")
    escalation_approved_by = relationship("User", foreign_keys=[escalation_approved_by_user_id])
    compliance_tracking = relationship("ComplianceTracking", back_populates="takedown_notice", uselist=False, cascade="all, delete-orphan")

# ============================================================================
# COMPLIANCE TRACKING
# ============================================================================

class ComplianceTracking(Base):
    __tablename__ = "compliance_tracking"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    takedown_notice_id = Column(UUID(as_uuid=True), ForeignKey("takedown_notices.id"), nullable=False)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False)
    
    # Tracking Status
    status = Column(Enum(ComplianceStatus), default=ComplianceStatus.PENDING)
    
    # Detection Results
    last_checked_at = Column(DateTime)
    check_frequency = Column(String(50), default="daily")
    consecutive_checks_failed = Column(Integer, default=0)
    
    # Proof
    removal_screenshot_url = Column(String(500))
    removal_verified_at = Column(DateTime)
    
    # HTTP Response Tracking
    last_http_status_code = Column(Integer)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    takedown_notice = relationship("TakedownNotice", back_populates="compliance_tracking")
    brand = relationship("Brand", back_populates="compliance_tracking")

# ============================================================================
# WHITELIST & BLACKLIST
# ============================================================================

class WhitelistedDomain(Base):
    __tablename__ = "whitelisted_domains"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False)
    domain = Column(String(255), nullable=False)
    reason = Column(String(255))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    brand = relationship("Brand", back_populates="whitelisted_domains")

class BlacklistedDomain(Base):
    __tablename__ = "blacklisted_domains"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False)
    domain = Column(String(255), nullable=False)
    reason = Column(Text)
    repeat_offender = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    brand = relationship("Brand", back_populates="blacklisted_domains")

# ============================================================================
# SUBSCRIPTIONS & PLANS
# ============================================================================

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    display_name = Column(String(100))
    description = Column(Text)
    
    # Features
    max_products = Column(Integer, default=-1)
    max_monthly_scans = Column(Integer, default=-1)
    monitoring_frequency = Column(String(50), default="weekly")
    max_escalations_per_month = Column(Integer, default=-1)
    support_level = Column(String(50), default="community")
    shopify_integration = Column(Boolean, default=False)
    woocommerce_integration = Column(Boolean, default=False)
    api_access = Column(Boolean, default=False)
    
    # Pricing
    price_monthly = Column(Numeric(10, 2))
    price_yearly = Column(Numeric(10, 2))
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subscriptions = relationship("BrandSubscription", back_populates="plan")

class BrandSubscription(Base):
    __tablename__ = "brand_subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False, unique=True)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("subscription_plans.id"), nullable=False)
    
    # Subscription Period
    billing_period = Column(Enum(BillingPeriod), default=BillingPeriod.MONTHLY)
    started_at = Column(DateTime, default=datetime.utcnow)
    renews_at = Column(DateTime)
    expires_at = Column(DateTime)
    
    # Status
    status = Column(String(50), default="active")
    cancel_reason = Column(Text)
    canceled_at = Column(DateTime)
    
    # Payment
    total_price = Column(Numeric(10, 2))
    is_trial = Column(Boolean, default=False)
    trial_ends_at = Column(DateTime)
    
    # Credits
    monthly_scan_credits = Column(Integer)
    remaining_scan_credits = Column(Integer)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    brand = relationship("Brand", back_populates="subscription")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")
    invoices = relationship("Invoice", back_populates="subscription", cascade="all, delete-orphan")

# ============================================================================
# BILLING & PAYMENTS
# ============================================================================

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False)
    subscription_id = Column(UUID(as_uuid=True), ForeignKey("brand_subscriptions.id"), nullable=False)
    
    # Invoice Details
    invoice_number = Column(String(100), unique=True, nullable=False)
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.DRAFT)
    
    # Amounts
    subtotal = Column(Numeric(10, 2))
    tax = Column(Numeric(10, 2))
    total_amount = Column(Numeric(10, 2))
    
    # Dates
    invoice_date = Column(Date)
    due_date = Column(Date)
    paid_at = Column(DateTime)
    
    # Payment Method
    payment_method = Column(Enum(PaymentMethod))
    payment_gateway_reference = Column(String(255))
    
    # Notes
    notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    brand = relationship("Brand", back_populates="invoices")
    subscription = relationship("BrandSubscription", back_populates="invoices")

# ============================================================================
# AUDIT LOGS
# ============================================================================

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"))
    
    # Action Details
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100))
    entity_id = Column(UUID(as_uuid=True))
    
    # Changes
    old_values = Column(JSONB)
    new_values = Column(JSONB)
    changes_description = Column(Text)
    
    # Context
    ip_address = Column(String(50))
    user_agent = Column(Text)
    
    # Additional Details
    metadata = Column(JSONB)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs", foreign_keys=[user_id])
    brand = relationship("Brand", back_populates="audit_logs", foreign_keys=[brand_id])

# ============================================================================
# TEMPLATES
# ============================================================================

class TakedownTemplate(Base):
    __tablename__ = "takedown_templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    country = Column(String(100))
    language = Column(String(50), default="en")
    
    # Template Content
    subject_line = Column(Text)
    body_template = Column(Text)
    
    # Settings
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    legal_reviewed = Column(Boolean, default=True)
    legal_review_notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ReminderTemplate(Base):
    __tablename__ = "reminder_templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    reminder_number = Column(Integer)
    
    # Template Content
    subject_line = Column(Text)
    body_template = Column(Text)
    
    # Settings
    days_after_notice = Column(Integer)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ============================================================================
# PLATFORM INTEGRATIONS
# ============================================================================

class PlatformIntegration(Base):
    __tablename__ = "platform_integrations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False)
    
    # Platform Type
    platform_type = Column(String(50), nullable=False)
    
    # Credentials
    api_key = Column(String(500))
    api_secret = Column(String(500))
    access_token = Column(String(500))
    store_url = Column(String(500))
    
    # Status
    is_connected = Column(Boolean, default=True)
    last_synced_at = Column(DateTime)
    
    # Sync Settings
    auto_sync_products = Column(Boolean, default=True)
    sync_frequency = Column(String(50), default="daily")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    brand = relationship("Brand", back_populates="platform_integrations")

# ============================================================================
# SYSTEM ALERTS & NOTIFICATIONS
# ============================================================================

class SystemAlert(Base):
    __tablename__ = "system_alerts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    # Alert Details
    alert_type = Column(Enum(AlertType), nullable=False)
    title = Column(String(255))
    message = Column(Text)
    
    # Severity
    severity = Column(Enum(AlertSeverity), default=AlertSeverity.INFO)
    
    # Status
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime)
    
    # Related Entity
    related_entity_type = Column(String(100))
    related_entity_id = Column(UUID(as_uuid=True))
    
    # Link for action
    action_url = Column(String(500))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    brand = relationship("Brand", back_populates="system_alerts", foreign_keys=[brand_id])
    user = relationship("User", back_populates="alerts", foreign_keys=[user_id])

# ============================================================================
# ABUSE FLAGS
# ============================================================================

class AbuseFlag(Base):
    __tablename__ = "abuse_flags"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False)
    
    # Flag Details
    flag_reason = Column(String(100), nullable=False)
    description = Column(Text)
    severity = Column(String(50), default="medium")
    
    # Metrics that triggered flag
    metrics_snapshot = Column(JSONB)
    
    # Actions
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime)
    admin_notes = Column(Text)
    
    flagged_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    brand = relationship("Brand", back_populates="abuse_flags")
    flagged_by = relationship("User", foreign_keys=[flagged_by_user_id])

# ============================================================================
# USAGE TRACKING
# ============================================================================

class UsageTracking(Base):
    __tablename__ = "usage_tracking"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False)
    
    # Monthly Tracking
    month_year = Column(Date)
    
    # Metrics
    total_scans = Column(Integer, default=0)
    successful_scans = Column(Integer, default=0)
    failed_scans = Column(Integer, default=0)
    matches_detected = Column(Integer, default=0)
    takedowns_sent = Column(Integer, default=0)
    takedowns_completed = Column(Integer, default=0)
    escalations_triggered = Column(Integer, default=0)
    
    # Rates
    false_positive_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    brand = relationship("Brand", back_populates="usage_tracking")
