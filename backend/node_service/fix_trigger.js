import sequelize from './src/config/db.js';

async function fixTrigger() {
    try {
        console.log("Starting SQL trigger fix...");
        
        // 1. Redefine sync_created_date_func to ONLY use created_at
        await sequelize.query(`
            CREATE OR REPLACE FUNCTION sync_created_date_func()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.created_at IS NOT NULL THEN
                    NEW.created_date := NEW.created_at::DATE;
                ELSE
                    NEW.created_date := CURRENT_DATE;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);
        console.log("[OK] Redefined sync_created_date_func.");

        // 2. Create function for sent_notices using sentAt
        await sequelize.query(`
            CREATE OR REPLACE FUNCTION sync_sent_notices_date_func()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW."sentAt" IS NOT NULL THEN
                    NEW.created_date := NEW."sentAt"::DATE;
                ELSE
                    NEW.created_date := CURRENT_DATE;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);
        console.log("[OK] Created sync_sent_notices_date_func.");

        // 3. Create function for AuditLogs using createdAt
        await sequelize.query(`
            CREATE OR REPLACE FUNCTION sync_audit_logs_date_func()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW."createdAt" IS NOT NULL THEN
                    NEW.created_date := NEW."createdAt"::DATE;
                ELSE
                    NEW.created_date := CURRENT_DATE;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);
        console.log("[OK] Created sync_audit_logs_date_func.");

        // 4. Update the trigger on sent_notices to use the new function
        await sequelize.query(`
            DROP TRIGGER IF EXISTS trg_sync_date_sent_notices ON sent_notices;
            CREATE TRIGGER trg_sync_date_sent_notices
            BEFORE INSERT OR UPDATE ON sent_notices
            FOR EACH ROW EXECUTE FUNCTION sync_sent_notices_date_func();
        `);
        console.log("[OK] Updated trigger on sent_notices.");

        // 5. Update the trigger on AuditLogs to use the new function
        await sequelize.query(`
            DROP TRIGGER IF EXISTS "trg_sync_date_AuditLogs" ON "AuditLogs";
            CREATE TRIGGER "trg_sync_date_AuditLogs"
            BEFORE INSERT OR UPDATE ON "AuditLogs"
            FOR EACH ROW EXECUTE FUNCTION sync_audit_logs_date_func();
        `);
        console.log("[OK] Updated trigger on AuditLogs.");

        console.log("Trigger fix completed successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Failed to fix trigger:", e);
        process.exit(1);
    }
}

fixTrigger();
