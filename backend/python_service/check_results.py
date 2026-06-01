import psycopg2
conn = psycopg2.connect("dbname=designproof_db user=postgres password=Neha@12345 host=localhost")
cur = conn.cursor()
cur.execute('SELECT website, similarity_score, match_type FROM notices ORDER BY id DESC LIMIT 10')
rows = cur.fetchall()
for r in rows:
    print(f"WEB: {r[0]} | SCORE: {r[1]} | TYPE: {r[2]}")
conn.close()
