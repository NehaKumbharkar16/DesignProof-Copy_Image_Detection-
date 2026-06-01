-- ==========================================
-- Migration: Date-Wise Optimization
-- ==========================================

-- 1. Create a generic trigger function for date synchronization
-- This function extracts the DATE part from common timestamp columns
CREATE OR REPLACE FUNCTION sync_created_date_func()
RETURNS TRIGGER AS $$
BEGIN
    -- Extract date from whichever timestamp column exists in the table
    IF TG_TABLE_NAME = 'sent_notices' AND NEW."sentAt" IS NOT NULL THEN
        NEW.created_date := NEW."sentAt"::DATE;
    ELSIF TG_TABLE_NAME = 'AuditLogs' AND NEW."createdAt" IS NOT NULL THEN
        NEW.created_date := NEW."createdAt"::DATE;
    ELSIF NEW.created_at IS NOT NULL THEN
        NEW.created_date := NEW.created_at::DATE;
    ELSE
        NEW.created_date := CURRENT_DATE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Helper Procedure to apply date optimization to a table
-- Parameters: table_name, timestamp_column_name
CREATE OR REPLACE PROCEDURE optimize_table_for_date(t_name TEXT, ts_col TEXT)
LANGUAGE plpgsql AS $$
BEGIN
    -- Add created_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t_name AND column_name = 'created_date') THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN created_date DATE', t_name);
        
        -- Populate existing data
        EXECUTE format('UPDATE %I SET created_date = %I::DATE', t_name, ts_col);
        
        -- Add indexes
        EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (%I)', 'idx_' || t_name || '_ts', t_name, ts_col);
        EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (created_date)', 'idx_' || t_name || '_date', t_name);
        
        -- Add trigger
        EXECUTE format('CREATE TRIGGER %I BEFORE INSERT OR UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION sync_created_date_func()', 'trg_sync_date_' || t_name, t_name);
        
        RAISE NOTICE 'Optimized table: %', t_name;
    ELSE
        RAISE NOTICE 'Table % already optimized', t_name;
    END IF;
END;
$$;

-- 3. Apply optimization to key tables
CALL optimize_table_for_date('detected_matches', 'created_at');
CALL optimize_table_for_date('sent_notices', 'created_at');
CALL optimize_table_for_date('audit_logs', 'created_at');
CALL optimize_table_for_date('AuditLogs', 'createdAt');
CALL optimize_table_for_date('Detections', 'created_at');

-- 4. Clean up the procedure (optional)
-- DROP PROCEDURE optimize_table_for_date;

-- ==========================================
-- Example Queries for User
-- ==========================================

/*
a) Fetching data date-wise:
SELECT * FROM detected_matches ORDER BY created_date DESC, created_at DESC;

b) Counting records per day:
SELECT created_date, COUNT(*) as daily_count 
FROM detected_matches 
GROUP BY created_date 
ORDER BY created_date DESC;

c) Filtering by a specific date:
SELECT * FROM detected_matches WHERE created_date = '2024-05-11';
*/
