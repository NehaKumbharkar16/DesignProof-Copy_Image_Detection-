-- ==========================================
-- Migration: Enforcement Workflow
-- ==========================================

-- 1. Add enforcement tracking columns to detected_matches
ALTER TABLE detected_matches 
ADD COLUMN IF NOT EXISTS first_notice_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS second_notice_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deadline_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS enforcement_status VARCHAR(50) DEFAULT 'detected',
ADD COLUMN IF NOT EXISTS is_removed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMP WITH TIME ZONE;

-- 2. Update existing records (optional, but good for consistency)
UPDATE detected_matches 
SET enforcement_status = 'detected' 
WHERE enforcement_status IS NULL;

-- 3. Add an index for the scheduled jobs to query efficiently
CREATE INDEX IF NOT EXISTS idx_detected_matches_enforcement ON detected_matches(enforcement_status, is_removed, deadline_at);
