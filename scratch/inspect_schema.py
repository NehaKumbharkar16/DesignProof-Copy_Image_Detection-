import psycopg2
import json

def get_table_schema(table_name):
    try:
        conn = psycopg2.connect('postgresql://postgres:Neha%4012345@localhost/designproof_db')
        cur = conn.cursor()
        cur.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table_name}'")
        columns = cur.fetchall()
        cur.close()
        conn.close()
        return columns
    except Exception as e:
        return str(e)

tables = ['detected_matches', 'sent_notices', 'audit_logs', 'AuditLogs', 'Detections']
schemas = {table: get_table_schema(table) for table in tables}

print(json.dumps(schemas, indent=2))
