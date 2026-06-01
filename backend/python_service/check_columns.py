import psycopg2
try:
    conn = psycopg2.connect(host='localhost', database='designproof_db', user='postgres', password='Neha@12345')
    cur = conn.cursor()
    
    tables = ['sent_notices', 'detected_matches', 'notices', 'takedown_notices']
    for table in tables:
        print(f"\n--- Columns in {table} ---")
        cur.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table}'")
        cols = cur.fetchall()
        for col in cols:
            print(f"{col[0]}: {col[1]}")
            
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)
