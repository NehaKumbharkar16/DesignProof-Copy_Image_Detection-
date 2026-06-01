import psycopg2

def show_data():
    conn = psycopg2.connect('postgresql://postgres:Neha%4012345@localhost/designproof_db')
    cur = conn.cursor()
    
    print("\n--- [1] INFringing LINKS (detected_matches) ---")
    cur.execute("SELECT id, infringing_url, similarity_score, created_date FROM detected_matches LIMIT 5")
    for row in cur.fetchall():
        print(row)
    
    print("\n--- [2] SEARCH DATA / PRODUCTS (products) ---")
    cur.execute("SELECT id, name, created_at FROM products LIMIT 5")
    for row in cur.fetchall():
        print(row)
    
    print("\n--- [3] SENT EMAILS STATUS (sent_notices) ---")
    cur.execute("SELECT id, \"recipientEmail\", status, created_date FROM sent_notices LIMIT 5")
    for row in cur.fetchall():
        print(row)
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    show_data()
