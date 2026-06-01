
import os
import psycopg2
from dotenv import load_dotenv

# Try to find the .env file in the node_service directory first, as it has the DB info
dotenv_path = r'd:\Internship_Gristip\DesignProof\backend\node_service\.env'
load_dotenv(dotenv_path)

def check_db():
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "designproof_db"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "Neha@12345"),
            port=os.getenv("DB_PORT", "5432")
        )
        cursor = conn.cursor()
        
        print("Checking tables...")
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        tables = cursor.fetchall()
        for t in tables:
            print(f"Table: {t[0]}")
            
        print("\nChecking users...")
        cursor.execute("SELECT id, email, created_at FROM users")
        users = cursor.fetchall()
        for u in users:
            print(f"User: {u}")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()
