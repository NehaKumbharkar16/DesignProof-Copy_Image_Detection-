import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def test_conn():
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "postgres"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "postgres"),
            port=os.getenv("DB_PORT", "5432")
        )
        print("Connection successful!")
        conn.close()
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == '__main__':
    test_conn()
