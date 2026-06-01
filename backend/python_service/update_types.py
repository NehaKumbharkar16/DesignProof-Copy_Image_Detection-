import psycopg2
try:
    conn = psycopg2.connect(host='localhost', database='designproof_db', user='postgres', password='Neha@12345')
    cur = conn.cursor()
    cur.execute('ALTER TABLE sent_notices ALTER COLUMN "originalImageUrl" TYPE TEXT')
    cur.execute('ALTER TABLE sent_notices ALTER COLUMN "copiedImageUrl" TYPE TEXT')
    conn.commit()
    print("Columns updated successfully to TEXT")
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)
