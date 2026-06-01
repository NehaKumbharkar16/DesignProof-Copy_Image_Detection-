
import os
import psycopg2
from dotenv import load_dotenv

# Try to find the .env file in the node_service directory first
dotenv_path = r'd:\Internship_Gristip\DesignProof\backend\node_service\.env'
load_dotenv(dotenv_path)

def check_capital_users():
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "designproof_db"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "Neha@12345"),
            port=os.getenv("DB_PORT", "5432")
        )
        cursor = conn.cursor()
        
        print("\nChecking \"Users\" (Capitalized table)...")
        try:
            cursor.execute("SELECT id, email FROM \"Users\"")
            rows = cursor.fetchall()
            for r in rows:
                print(f"User in \"Users\": {r}")
        except Exception as e:
            print(f"No \"Users\" table or error: {e}")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_capital_users()
