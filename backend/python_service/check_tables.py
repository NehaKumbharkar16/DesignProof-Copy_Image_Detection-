import psycopg2
try:
    conn = psycopg2.connect(host='localhost', database='designproof_db', user='postgres', password='Neha@12345')
    cur = conn.cursor()
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
    tables = [t[0] for t in cur.fetchall()]
    print("Tables in database:", tables)
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)
