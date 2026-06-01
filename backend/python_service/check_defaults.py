import psycopg2
try:
    conn = psycopg2.connect(host='localhost', database='designproof_db', user='postgres', password='Neha@12345')
    cur = conn.cursor()
    cur.execute("SELECT column_name, column_default FROM information_schema.columns WHERE table_name = 'sent_notices'")
    for row in cur.fetchall():
        print(f"Column: {row[0]}, Default: {row[1]}")
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)
