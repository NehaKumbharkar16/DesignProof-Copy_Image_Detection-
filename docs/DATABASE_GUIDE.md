# DesignProof Database Guide

## Database Schema Overview

The DesignProof database consists of 26 interconnected tables designed for comprehensive brand protection and SaaS management.

## Table Relationships Diagram

```
users
  ├── brands (1:N)
  ├── audit_logs (1:N)
  ├── system_alerts (1:N)
  ├── takedown_notices (1:N via escalation approval)
  └── detected_matches (1:N via approval)

brands
  ├── products (1:N)
  ├── monitoring_settings (1:1)
  ├── detected_matches (1:N)
  ├── takedown_notices (1:N)
  ├── compliance_tracking (1:N)
  ├── whitelisted_domains (1:N)
  ├── blacklisted_domains (1:N)
  ├── subscriptions (1:1)
  ├── invoices (1:N)
  ├── platform_integrations (1:N)
  ├── system_alerts (1:N)
  ├── abuse_flags (1:N)
  └── usage_tracking (1:N)

products
  ├── product_images (1:N)
  ├── detected_matches (1:N)
  └── takedown_notices (1:N)

detected_matches
  ├── takedown_notices (1:1)
  └── compliance_tracking (1:1)

takedown_notices
  ├── compliance_tracking (1:1)
  ├── detected_matches (1:1 via relation)
  └── escalations

subscription_plans
  └── brand_subscriptions (1:N)

brand_subscriptions
  └── invoices (1:N)
```

## Core Tables

### 1. Users Table

Stores all system users (clients, admins, support staff).

```sql
SELECT * FROM users;

-- Key columns:
-- id: UUID primary key
-- email: Unique identifier
-- password_hash: bcrypt hash
-- role: 'admin', 'client', 'support'
-- is_active: Account status
-- is_verified: Email verification status
```

**Example Insert:**
```sql
INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified)
VALUES ('user@example.com', '$2b$10$...', 'John', 'Doe', 'client', true);
```

### 2. Brands Table

Represents client organizations/brands.

```sql
SELECT * FROM brands WHERE owner_id = 'user_uuid';

-- Key columns:
-- id: UUID primary key
-- owner_id: FK to users
-- is_verified: Website ownership verified
-- verification_token: For domain verification
-- authorization_accepted: Legal terms accepted
-- subscription_status: 'free', 'active', 'paused', 'expired'
```

**Important Queries:**
```sql
-- Get brand with all details
SELECT b.*, 
       COUNT(p.id) as product_count,
       COUNT(dm.id) as detection_count
FROM brands b
LEFT JOIN products p ON p.brand_id = b.id
LEFT JOIN detected_matches dm ON dm.brand_id = b.id
WHERE b.id = 'brand_uuid'
GROUP BY b.id;

-- Brands with expired subscriptions
SELECT b.* FROM brands b
JOIN brand_subscriptions bs ON bs.brand_id = b.id
WHERE bs.expires_at < NOW() AND bs.status = 'active';
```

### 3. Products Table

Stores client's product designs.

```sql
SELECT * FROM products WHERE brand_id = 'brand_uuid';

-- Key columns:
-- id: UUID primary key
-- brand_id: FK to brands
-- image_fingerprint: AI-generated visual hash
-- image_hash: File-based hash
-- protection_active: Monitoring status
-- priority: 'low', 'medium', 'high', 'critical'
-- original_created_at: When client created the product
```

**Queries:**
```sql
-- Products by priority
SELECT * FROM products 
WHERE brand_id = 'brand_uuid' AND priority = 'critical'
ORDER BY created_at DESC;

-- Products with most detections
SELECT p.id, p.name, COUNT(dm.id) as detection_count
FROM products p
LEFT JOIN detected_matches dm ON dm.product_id = p.id
WHERE p.brand_id = 'brand_uuid'
GROUP BY p.id
ORDER BY detection_count DESC
LIMIT 10;

-- Recently added products
SELECT * FROM products
WHERE brand_id = 'brand_uuid'
ORDER BY created_at DESC
LIMIT 20;
```

### 4. ProductImages Table

Multiple images per product for comprehensive protection.

```sql
SELECT * FROM product_images WHERE product_id = 'product_uuid';

-- Key columns:
-- product_id: FK to products
-- image_fingerprint: AI visual fingerprint
-- image_hash: File hash
-- is_primary: Primary product image
```

### 5. DetectedMatches Table

**CRITICAL TABLE** - AI-identified potential infringements.

```sql
SELECT * FROM detected_matches 
WHERE brand_id = 'brand_uuid' 
ORDER BY detected_at DESC;

-- Key columns:
-- product_id: FK to products
-- brand_id: FK to brands
-- similarity_score: 0-100 (floating point)
-- confidence_tag: 'direct_copy', 'modified_copy', 'inspired'
-- client_status: 'pending', 'approved', 'ignored'
-- detected_platform: 'shopify', 'google_images', 'd2c_website'
```

**Important Queries:**
```sql
-- Pending detections for review
SELECT dm.*, p.name as product_name, p.primary_image_url
FROM detected_matches dm
JOIN products p ON p.id = dm.product_id
WHERE dm.brand_id = 'brand_uuid' AND dm.client_status = 'pending'
ORDER BY dm.similarity_score DESC;

-- High confidence direct copies
SELECT * FROM detected_matches
WHERE brand_id = 'brand_uuid' 
  AND confidence_tag = 'direct_copy'
  AND similarity_score >= 90
  AND client_status = 'pending';

-- Detections by platform
SELECT detected_platform, COUNT(*) as count
FROM detected_matches
WHERE brand_id = 'brand_uuid' AND created_at > NOW() - INTERVAL '30 days'
GROUP BY detected_platform;

-- Detections approved for takedown
SELECT COUNT(*) FROM detected_matches
WHERE brand_id = 'brand_uuid' AND client_status = 'approved';
```

### 6. TakedownNotices Table

**CRITICAL TABLE** - Tracks all legal notices sent.

```sql
SELECT * FROM takedown_notices 
WHERE brand_id = 'brand_uuid'
ORDER BY sent_at DESC;

-- Key columns:
-- detected_match_id: FK to detected_matches (unique)
-- notice_status: 'pending', 'sent', 'awaiting_response', 'escalated', 'resolved'
-- target_url: Infringing URL
-- target_platform: 'shopify', 'd2c_website', etc.
-- sent_at: When notice was sent
-- deadline_at: Compliance deadline
-- is_shopify_store: Auto-detected
-- is_escalated: Escalation triggered
```

**Important Queries:**
```sql
-- Takedowns sent this month
SELECT COUNT(*), notice_status FROM takedown_notices
WHERE brand_id = 'brand_uuid' 
  AND sent_at > DATE_TRUNC('month', NOW())
GROUP BY notice_status;

-- Pending responses (no removal yet)
SELECT * FROM takedown_notices
WHERE brand_id = 'brand_uuid' 
  AND notice_status = 'awaiting_response'
  AND response_received = false
  AND deadline_at < NOW();

-- Successful takedowns (product removed)
SELECT COUNT(*) as successful_removals FROM takedown_notices t
JOIN compliance_tracking c ON c.takedown_notice_id = t.id
WHERE t.brand_id = 'brand_uuid' AND c.status = 'removed';

-- Overdue notices requiring escalation
SELECT t.* FROM takedown_notices t
WHERE t.brand_id = 'brand_uuid'
  AND t.notice_status = 'awaiting_response'
  AND t.deadline_at < NOW()
  AND t.is_escalated = false;
```

### 7. ComplianceTracking Table

Tracks removal verification and status.

```sql
SELECT * FROM compliance_tracking 
WHERE brand_id = 'brand_uuid'
ORDER BY last_checked_at DESC;

-- Key columns:
-- takedown_notice_id: FK to takedown_notices
-- status: 'pending', 'removed', 'replaced', 'ignored', 'escalated'
-- last_checked_at: Last verification attempt
-- last_http_status_code: 200, 404, etc.
-- removal_verified_at: When removal was confirmed
```

**Queries:**
```sql
-- Verify removal success rate
SELECT 
  COUNT(*) as total_takedowns,
  SUM(CASE WHEN status = 'removed' THEN 1 ELSE 0 END) as removed_count,
  ROUND(100.0 * SUM(CASE WHEN status = 'removed' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM compliance_tracking
WHERE brand_id = 'brand_uuid' AND created_at > NOW() - INTERVAL '30 days';

-- Pending removals to check
SELECT * FROM compliance_tracking
WHERE status = 'pending'
  AND last_checked_at < NOW() - INTERVAL '6 hours';

-- URLs still showing as 200 (not removed)
SELECT ct.*, t.target_url FROM compliance_tracking ct
JOIN takedown_notices t ON t.id = ct.takedown_notice_id
WHERE ct.last_http_status_code = 200
  AND ct.status = 'pending'
  AND ct.last_checked_at > NOW() - INTERVAL '1 day';
```

### 8. BrandSubscriptions Table

Subscription and billing status.

```sql
SELECT * FROM brand_subscriptions WHERE brand_id = 'brand_uuid';

-- Key columns:
-- plan_id: FK to subscription_plans
-- status: 'active', 'paused', 'canceled', 'expired'
-- renews_at: Next billing date
-- expires_at: Expiration date
-- monthly_scan_credits: Scan limit
-- remaining_scan_credits: Available scans
```

**Queries:**
```sql
-- Subscriptions expiring soon
SELECT b.name, bs.renews_at FROM brands b
JOIN brand_subscriptions bs ON bs.brand_id = b.id
WHERE bs.renews_at < NOW() + INTERVAL '7 days'
  AND bs.status = 'active';

-- Subscription usage
SELECT b.name, sp.name as plan_name, bs.monthly_scan_credits,
       bs.remaining_scan_credits,
       ROUND(100.0 * (bs.monthly_scan_credits - bs.remaining_scan_credits) / bs.monthly_scan_credits, 2) as usage_percent
FROM brands b
JOIN brand_subscriptions bs ON bs.brand_id = b.id
JOIN subscription_plans sp ON sp.id = bs.plan_id
WHERE bs.status = 'active';

-- Customers running out of credits
SELECT b.name, bs.remaining_scan_credits FROM brands b
JOIN brand_subscriptions bs ON bs.brand_id = b.id
WHERE bs.remaining_scan_credits < 100 AND bs.status = 'active';
```

### 9. WhitelistedDomains & BlacklistedDomains

```sql
-- View whitelist
SELECT * FROM whitelisted_domains WHERE brand_id = 'brand_uuid';

-- View blacklist
SELECT * FROM blacklisted_domains WHERE brand_id = 'brand_uuid';

-- Check if domain is whitelisted before takedown
SELECT EXISTS(
  SELECT 1 FROM whitelisted_domains
  WHERE brand_id = 'brand_uuid' AND domain = 'example.com'
);
```

### 10. AuditLogs Table

**MOST CRITICAL** - Complete legal audit trail.

```sql
SELECT * FROM audit_logs 
WHERE brand_id = 'brand_uuid'
ORDER BY created_at DESC;

-- Key columns:
-- user_id: Who performed action
-- action: 'created', 'updated', 'approved', 'sent', 'escalated'
-- entity_type: 'brand', 'product', 'detection', 'takedown'
-- old_values: JSONB before
-- new_values: JSONB after
-- ip_address: Source IP
-- user_agent: Browser info
```

**Critical Queries:**
```sql
-- Who approved this takedown and when?
SELECT u.email, al.created_at, al.new_values
FROM audit_logs al
JOIN users u ON u.id = al.user_id
WHERE al.action = 'approved' 
  AND al.entity_type = 'takedown_notice'
  AND al.entity_id = 'takedown_uuid'
ORDER BY al.created_at DESC;

-- Complete history of a detection
SELECT u.email, al.action, al.created_at, al.changes_description
FROM audit_logs al
LEFT JOIN users u ON u.id = al.user_id
WHERE al.entity_type = 'detected_match' 
  AND al.entity_id = 'match_uuid'
ORDER BY al.created_at ASC;

-- Legal audit for compliance officer review
SELECT al.created_at, u.email, al.action, al.entity_type,
       al.ip_address, al.user_agent,
       al.changes_description
FROM audit_logs al
LEFT JOIN users u ON u.id = al.user_id
WHERE al.brand_id = 'brand_uuid'
  AND al.created_at > '2024-01-01'
ORDER BY al.created_at DESC;
```

## Monitoring & Analytics

### Dashboard Queries

```sql
-- Brand KPIs
SELECT 
  b.name,
  COUNT(DISTINCT p.id) as total_products,
  COUNT(DISTINCT dm.id) as detections,
  COUNT(DISTINCT CASE WHEN dm.client_status = 'approved' THEN dm.id END) as approved,
  COUNT(DISTINCT CASE WHEN c.status = 'removed' THEN c.id END) as removed,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN c.status = 'removed' THEN c.id END) / 
        NULLIF(COUNT(DISTINCT CASE WHEN dm.client_status = 'approved' THEN dm.id END), 0), 2) as success_rate
FROM brands b
LEFT JOIN products p ON p.brand_id = b.id
LEFT JOIN detected_matches dm ON dm.brand_id = b.id
LEFT JOIN takedown_notices t ON t.detected_match_id = dm.id
LEFT JOIN compliance_tracking c ON c.takedown_notice_id = t.id
WHERE b.id = 'brand_uuid'
GROUP BY b.id, b.name;

-- System-wide metrics
SELECT 
  COUNT(DISTINCT b.id) as active_brands,
  COUNT(DISTINCT p.id) as monitored_products,
  COUNT(DISTINCT dm.id) as detections_found,
  COUNT(DISTINCT CASE WHEN t.notice_status = 'resolved' THEN t.id END) as resolved_takedowns,
  COUNT(DISTINCT CASE WHEN u.last_login_at > NOW() - INTERVAL '7 days' THEN u.id END) as active_users_7d
FROM brands b
LEFT JOIN products p ON p.brand_id = b.id
LEFT JOIN detected_matches dm ON dm.brand_id = b.id
LEFT JOIN takedown_notices t ON t.brand_id = b.id
LEFT JOIN users u ON u.id = b.owner_id
WHERE b.is_active = true AND b.subscription_status = 'active';

-- Revenue impact
SELECT 
  SUM(CASE WHEN c.status = 'removed' THEN dt.detected_product_price ELSE 0 END)::money as potential_revenue_protected
FROM compliance_tracking c
JOIN takedown_notices t ON t.id = c.takedown_notice_id
LEFT JOIN detected_matches dm ON dm.id = t.detected_match_id;
```

## Performance Optimization

### Query Tuning

```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM detected_matches 
WHERE brand_id = 'brand_uuid' AND similarity_score > 85;

-- Find slow queries
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Table statistics
SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Regular Maintenance

```sql
-- Vacuum and analyze (run weekly)
VACUUM ANALYZE;

-- Reindex fragmented tables
REINDEX TABLE detected_matches;
REINDEX TABLE takedown_notices;
REINDEX TABLE audit_logs;

-- Check for unused indexes
SELECT indexname FROM pg_stat_user_indexes 
WHERE idx_scan = 0 ORDER BY pg_relation_size(relid) DESC;
```

## Backup & Recovery

### Backup Strategy

```bash
# Full backup
pg_dump -U designproof_user -d designproof_db > backup_$(date +%Y%m%d).sql

# Compressed backup
pg_dump -U designproof_user -d designproof_db | gzip > backup_$(date +%Y%m%d).sql.gz

# Backup specific table
pg_dump -U designproof_user -d designproof_db -t audit_logs > audit_logs_$(date +%Y%m%d).sql

# Schedule daily backups
0 2 * * * pg_dump -U designproof_user -d designproof_db | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
```

### Recovery

```bash
# Restore from backup
psql -U designproof_user -d designproof_db < backup.sql

# Restore from compressed backup
gunzip -c backup.sql.gz | psql -U designproof_user -d designproof_db

# Restore specific table
psql -U designproof_user -d designproof_db < audit_logs.sql
```

## Database Troubleshooting

### Connection Issues

```sql
-- Current connections
SELECT datname, usename, application_name, state 
FROM pg_stat_activity;

-- Kill slow queries
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE pid <> pg_backend_pid() AND state = 'idle' AND query_start < NOW() - INTERVAL '1 hour';
```

### Lock Issues

```sql
-- Find locks
SELECT * FROM pg_locks 
WHERE NOT granted;

-- Kill blocking queries
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE usename NOT IN ('postgres') AND state = 'idle in transaction';
```

## Data Retention Policy

```sql
-- Archive old audit logs (keep 1 year)
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';

-- Archive old compliance data
DELETE FROM compliance_tracking 
WHERE created_at < NOW() - INTERVAL '2 years' 
  AND status = 'resolved';

-- Archive removed detections (keep 2 years for legal)
DELETE FROM detected_matches 
WHERE created_at < NOW() - INTERVAL '2 years' 
  AND client_status IN ('ignored', 'ignored_similar');
```

---

For detailed SQL queries and examples, check the application code in `backend/services/` and `ai-service/app/services/`
