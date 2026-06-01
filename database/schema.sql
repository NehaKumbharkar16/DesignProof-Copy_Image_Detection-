-- DesignProof Database Schema
-- PostgreSQL Database for Brand & Design Protection SaaS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'client', -- 'admin', 'client', 'support'
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================================================
-- BRAND & ORGANIZATION
-- ============================================================================

CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    website_url VARCHAR(500),
    country VARCHAR(100),
    industry VARCHAR(100),
    logo_url VARCHAR(500),
    description TEXT,
    business_email VARCHAR(255),
    phone VARCHAR(20),
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verification_method VARCHAR(50), -- 'meta_tag', 'dns', 'file'
    verification_token VARCHAR(255) UNIQUE,
    verification_completed_at TIMESTAMP,
    
    -- Legal
    authorization_accepted BOOLEAN DEFAULT false,
    terms_accepted BOOLEAN DEFAULT false,
    authorized_at TIMESTAMP,
    
    -- Settings
    is_active BOOLEAN DEFAULT true,
    subscription_status VARCHAR(50) DEFAULT 'free', -- 'free', 'active', 'paused', 'expired'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brands_owner_id ON brands(owner_id);
CREATE INDEX idx_brands_website_url ON brands(website_url);
CREATE INDEX idx_brands_is_verified ON brands(is_verified);
CREATE INDEX idx_brands_subscription_status ON brands(subscription_status);

-- ============================================================================
-- PRODUCTS & DESIGNS
-- ============================================================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    category VARCHAR(100),
    collection VARCHAR(100),
    priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    description TEXT,
    
    -- Image & Visual Data
    primary_image_url VARCHAR(500),
    image_fingerprint VARCHAR(255), -- AI-generated visual fingerprint
    image_hash VARCHAR(255), -- Hash of original image
    
    -- Product URLs
    product_url VARCHAR(500),
    
    -- Status
    protection_active BOOLEAN DEFAULT true,
    
    -- Tracking
    original_created_at TIMESTAMP, -- When client's product was created
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_protection_active ON products(protection_active);
CREATE INDEX idx_products_priority ON products(priority);
CREATE INDEX idx_products_image_fingerprint ON products(image_fingerprint);

-- ============================================================================
-- PRODUCT IMAGES (Multiple images per product)
-- ============================================================================

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    image_fingerprint VARCHAR(255),
    image_hash VARCHAR(255),
    file_size INTEGER,
    dimensions VARCHAR(50), -- width x height
    is_primary BOOLEAN DEFAULT false,
    upload_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_fingerprint ON product_images(image_fingerprint);

-- ============================================================================
-- MONITORING SETTINGS
-- ============================================================================

CREATE TABLE monitoring_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL UNIQUE REFERENCES brands(id) ON DELETE CASCADE,
    
    -- Scan Settings
    scan_frequency VARCHAR(50) DEFAULT 'weekly', -- 'manual', 'daily', 'weekly', 'monthly'
    is_continuous_monitoring BOOLEAN DEFAULT true,
    
    -- Sources to Monitor
    scan_d2c_websites BOOLEAN DEFAULT true,
    scan_shopify_stores BOOLEAN DEFAULT true,
    scan_google_images BOOLEAN DEFAULT true,
    scan_social_ads BOOLEAN DEFAULT true,
    scan_marketplaces BOOLEAN DEFAULT false,
    
    -- Advanced Options
    similarity_threshold INTEGER DEFAULT 70, -- % threshold for flagging matches
    detect_color_variations BOOLEAN DEFAULT true,
    detect_background_swaps BOOLEAN DEFAULT true,
    detect_minor_edits BOOLEAN DEFAULT true,
    
    last_scan_at TIMESTAMP,
    next_scheduled_scan TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_monitoring_settings_brand_id ON monitoring_settings(brand_id);

-- ============================================================================
-- DETECTED COPIES / MATCHES
-- ============================================================================

CREATE TABLE detected_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    
    -- Infringing Content Details
    infringing_url VARCHAR(500) NOT NULL,
    infringing_image_url VARCHAR(500),
    detected_platform VARCHAR(100), -- 'shopify', 'd2c_website', 'google_images', 'social_ads', 'marketplace'
    
    -- AI Detection Results
    similarity_score DECIMAL(5,2) NOT NULL, -- 0-100
    confidence_tag VARCHAR(50) NOT NULL, -- 'direct_copy', 'modified_copy', 'inspired'
    ai_analysis_json JSONB, -- Detailed AI analysis data
    
    -- Additional Details
    detected_product_name VARCHAR(255),
    detected_seller_name VARCHAR(255),
    detected_seller_email VARCHAR(255),
    
    -- Approval Status
    client_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'ignored', 'ignored_similar'
    approved_by_user_id UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    
    -- Actions
    is_authorized_reseller BOOLEAN DEFAULT false,
    is_blacklisted BOOLEAN DEFAULT false,
    
    -- Screenshots & Proof
    screenshot_url VARCHAR(500),
    screenshot_taken_at TIMESTAMP,
    
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_detected_matches_brand_id ON detected_matches(brand_id);
CREATE INDEX idx_detected_matches_product_id ON detected_matches(product_id);
CREATE INDEX idx_detected_matches_infringing_url ON detected_matches(infringing_url);
CREATE INDEX idx_detected_matches_client_status ON detected_matches(client_status);
CREATE INDEX idx_detected_matches_similarity_score ON detected_matches(similarity_score);
CREATE INDEX idx_detected_matches_detected_platform ON detected_matches(detected_platform);

-- ============================================================================
-- TAKEDOWN REQUESTS & NOTICES
-- ============================================================================

CREATE TABLE takedown_notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    detected_match_id UUID NOT NULL UNIQUE REFERENCES detected_matches(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Notice Details
    notice_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'awaiting_response', 'escalated', 'resolved', 'ignored'
    sent_from_email VARCHAR(255),
    sent_to_email VARCHAR(255),
    
    -- Target Information
    target_url VARCHAR(500),
    target_platform VARCHAR(100),
    target_domain VARCHAR(255),
    target_hosting_provider VARCHAR(255),
    target_payment_gateway VARCHAR(255),
    target_ad_platform VARCHAR(100),
    
    -- Notice Content
    notice_content TEXT,
    notice_template_id UUID, -- Reference to template used
    
    -- Shopify Specific
    is_shopify_store BOOLEAN DEFAULT false,
    shopify_complaint_id VARCHAR(255),
    shopify_complaint_status VARCHAR(100),
    
    -- Escalation
    escalation_type VARCHAR(50), -- 'none', 'hosting', 'payment_gateway', 'ad_platform'
    is_escalated BOOLEAN DEFAULT false,
    escalation_approved BOOLEAN DEFAULT false,
    escalation_approved_by_user_id UUID REFERENCES users(id),
    escalation_approved_at TIMESTAMP,
    
    -- Deadline
    deadline_days INTEGER DEFAULT 3,
    deadline_at TIMESTAMP,
    
    -- Responses
    response_received BOOLEAN DEFAULT false,
    response_received_at TIMESTAMP,
    response_content TEXT,
    
    -- Tracking
    reminders_sent INTEGER DEFAULT 0,
    last_reminder_sent_at TIMESTAMP,
    final_reminder_sent BOOLEAN DEFAULT false,
    
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_takedown_notices_brand_id ON takedown_notices(brand_id);
CREATE INDEX idx_takedown_notices_product_id ON takedown_notices(product_id);
CREATE INDEX idx_takedown_notices_notice_status ON takedown_notices(notice_status);
CREATE INDEX idx_takedown_notices_target_url ON takedown_notices(target_url);
CREATE INDEX idx_takedown_notices_sent_at ON takedown_notices(sent_at);
CREATE INDEX idx_takedown_notices_is_escalated ON takedown_notices(is_escalated);

-- ============================================================================
-- COMPLIANCE TRACKING & REMOVAL STATUS
-- ============================================================================

CREATE TABLE compliance_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    takedown_notice_id UUID NOT NULL REFERENCES takedown_notices(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    
    -- Tracking Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'removed', 'replaced', 'ignored', 'escalated'
    
    -- Detection Results
    last_checked_at TIMESTAMP,
    check_frequency VARCHAR(50) DEFAULT 'daily', -- daily or custom
    consecutive_checks_failed INTEGER DEFAULT 0,
    
    -- Proof
    removal_screenshot_url VARCHAR(500),
    removal_verified_at TIMESTAMP,
    
    -- HTTP Response Tracking
    last_http_status_code INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_compliance_tracking_brand_id ON compliance_tracking(brand_id);
CREATE INDEX idx_compliance_tracking_status ON compliance_tracking(status);
CREATE INDEX idx_compliance_tracking_last_checked_at ON compliance_tracking(last_checked_at);

-- ============================================================================
-- WHITELIST & BLACKLIST
-- ============================================================================

CREATE TABLE whitelisted_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    reason VARCHAR(255), -- e.g., 'authorized_reseller', 'distributor'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_whitelisted_domains_brand_id ON whitelisted_domains(brand_id);
CREATE INDEX idx_whitelisted_domains_domain ON whitelisted_domains(domain);

CREATE TABLE blacklisted_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    reason TEXT,
    repeat_offender BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blacklisted_domains_brand_id ON blacklisted_domains(brand_id);
CREATE INDEX idx_blacklisted_domains_domain ON blacklisted_domains(domain);

-- ============================================================================
-- SUBSCRIPTIONS & PLANS
-- ============================================================================

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE, -- 'Free', 'Growth', 'Scale', 'Enterprise'
    display_name VARCHAR(100),
    description TEXT,
    
    -- Features
    max_products INTEGER DEFAULT -1, -- -1 = unlimited
    max_monthly_scans INTEGER DEFAULT -1,
    monitoring_frequency VARCHAR(50) DEFAULT 'weekly', -- 'manual', 'daily', 'weekly', 'monthly'
    max_escalations_per_month INTEGER DEFAULT -1,
    support_level VARCHAR(50) DEFAULT 'community', -- 'community', 'email', 'priority', 'dedicated'
    shopify_integration BOOLEAN DEFAULT false,
    woocommerce_integration BOOLEAN DEFAULT false,
    api_access BOOLEAN DEFAULT false,
    
    -- Pricing
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE brand_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL UNIQUE REFERENCES brands(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    
    -- Subscription Period
    billing_period VARCHAR(50) DEFAULT 'monthly', -- 'monthly', 'yearly'
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    renews_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'canceled', 'expired'
    cancel_reason TEXT,
    canceled_at TIMESTAMP,
    
    -- Payment
    total_price DECIMAL(10,2),
    is_trial BOOLEAN DEFAULT false,
    trial_ends_at TIMESTAMP,
    
    -- Credits (if applicable)
    monthly_scan_credits INTEGER,
    remaining_scan_credits INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brand_subscriptions_brand_id ON brand_subscriptions(brand_id);
CREATE INDEX idx_brand_subscriptions_plan_id ON brand_subscriptions(plan_id);
CREATE INDEX idx_brand_subscriptions_status ON brand_subscriptions(status);
CREATE INDEX idx_brand_subscriptions_renews_at ON brand_subscriptions(renews_at);

-- ============================================================================
-- BILLING & PAYMENTS
-- ============================================================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES brand_subscriptions(id) ON DELETE CASCADE,
    
    -- Invoice Details
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'overdue', 'canceled'
    
    -- Amounts
    subtotal DECIMAL(10,2),
    tax DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    
    -- Dates
    invoice_date DATE,
    due_date DATE,
    paid_at TIMESTAMP,
    
    -- Payment Method
    payment_method VARCHAR(50), -- 'credit_card', 'bank_transfer', 'paypal'
    payment_gateway_reference VARCHAR(255),
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_brand_id ON invoices(brand_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- ============================================================================
-- AUDIT LOGS (CRITICAL FOR COMPLIANCE)
-- ============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    
    -- Action Details
    action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'deleted', 'approved', 'sent', 'escalated'
    entity_type VARCHAR(100), -- 'brand', 'product', 'detected_match', 'takedown_notice'
    entity_id UUID,
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    changes_description TEXT,
    
    -- Context
    ip_address VARCHAR(50),
    user_agent TEXT,
    
    -- Additional Details
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_brand_id ON audit_logs(brand_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- TAKEDOWN EMAIL TEMPLATES (ADMIN CONTROLLED)
-- ============================================================================

CREATE TABLE takedown_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    country VARCHAR(100), -- Country-specific template
    language VARCHAR(50) DEFAULT 'en',
    
    -- Template Content
    subject_line TEXT,
    body_template TEXT, -- Contains placeholders like {{brand_name}}, {{original_url}}, {{infringing_url}}
    
    -- Settings
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    legal_reviewed BOOLEAN DEFAULT true,
    legal_review_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reminder_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    reminder_number INTEGER, -- 1st, 2nd, final reminder
    
    -- Template Content
    subject_line TEXT,
    body_template TEXT,
    
    -- Settings
    days_after_notice INTEGER,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PLATFORM INTEGRATIONS
-- ============================================================================

CREATE TABLE platform_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    
    -- Platform Type
    platform_type VARCHAR(50) NOT NULL, -- 'shopify', 'woocommerce', 'etsy'
    
    -- Credentials
    api_key VARCHAR(500),
    api_secret VARCHAR(500),
    access_token VARCHAR(500),
    store_url VARCHAR(500),
    
    -- Status
    is_connected BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP,
    
    -- Sync Settings
    auto_sync_products BOOLEAN DEFAULT true,
    sync_frequency VARCHAR(50) DEFAULT 'daily',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_platform_integrations_brand_id ON platform_integrations(brand_id);
CREATE INDEX idx_platform_integrations_platform_type ON platform_integrations(platform_type);

-- ============================================================================
-- SYSTEM ALERTS & NOTIFICATIONS
-- ============================================================================

CREATE TABLE system_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Alert Details
    alert_type VARCHAR(100) NOT NULL, -- 'new_match_detected', 'takedown_sent', 'removal_confirmed', 'escalation_needed'
    title VARCHAR(255),
    message TEXT,
    
    -- Severity
    severity VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'critical'
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    
    -- Related Entity
    related_entity_type VARCHAR(100),
    related_entity_id UUID,
    
    -- Link for action
    action_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_alerts_user_id ON system_alerts(user_id);
CREATE INDEX idx_system_alerts_brand_id ON system_alerts(brand_id);
CREATE INDEX idx_system_alerts_alert_type ON system_alerts(alert_type);
CREATE INDEX idx_system_alerts_is_read ON system_alerts(is_read);

-- ============================================================================
-- ADMIN DASHBOARD DATA
-- ============================================================================

CREATE TABLE abuse_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    
    -- Flag Details
    flag_reason VARCHAR(100) NOT NULL, -- 'excessive_takedowns', 'repeated_targeting', 'suspicious_patterns'
    description TEXT,
    severity VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    
    -- Metrics that triggered flag
    metrics_snapshot JSONB,
    
    -- Actions
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    admin_notes TEXT,
    
    flagged_by_user_id UUID REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_abuse_flags_brand_id ON abuse_flags(brand_id);
CREATE INDEX idx_abuse_flags_is_resolved ON abuse_flags(is_resolved);

-- ============================================================================
-- USAGE TRACKING
-- ============================================================================

CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    
    -- Monthly Tracking
    month_year DATE,
    
    -- Metrics
    total_scans INTEGER DEFAULT 0,
    successful_scans INTEGER DEFAULT 0,
    failed_scans INTEGER DEFAULT 0,
    matches_detected INTEGER DEFAULT 0,
    takedowns_sent INTEGER DEFAULT 0,
    takedowns_completed INTEGER DEFAULT 0,
    escalations_triggered INTEGER DEFAULT 0,
    
    -- Rates
    false_positive_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usage_tracking_brand_id ON usage_tracking(brand_id);
CREATE INDEX idx_usage_tracking_month_year ON usage_tracking(month_year);

-- ============================================================================
-- DATA RETENTION POLICIES
-- ============================================================================

-- Automatically delete old logs after retention period
-- This is handled at application level with scheduled tasks
-- Consider using PostgreSQL partitioning for audit_logs if dealing with millions of records

COMMIT;
