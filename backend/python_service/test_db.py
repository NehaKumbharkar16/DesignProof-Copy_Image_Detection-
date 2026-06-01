import psycopg2
conn = psycopg2.connect("dbname=designproof_db user=postgres password=Neha@12345 host=localhost")
cur = conn.cursor()
cur.execute('SELECT COUNT(*) FROM "Users"')
print('Users (Capital U):', cur.fetchone()[0])
cur.execute('SELECT COUNT(*) FROM users')
print('users (Lowercase u):', cur.fetchone()[0])
