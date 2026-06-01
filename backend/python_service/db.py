import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    try:
        return psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "designproof_db"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "Neha@12345"),
            port=os.getenv("DB_PORT", "5432")
        )
    except psycopg2.Error as e:
        print(f"[Database] Connection failed: {e}")
        return None

def init_db():
    # Tables are managed by the Node service (Sequelize)
    # This remains as a placeholder to avoid breaking app.py
    print("[Database] DB Init requested (Skipped - Handled by Node Gateway)")
    pass

def save_email(email, website, original_image_url, copied_image_url, status=0, similarity_score=None, match_type=None, p_hash=None, metadata=None):
    # Persistence is handled by the Node Gateway during the discovery flow.
    # We log it here for debugging purposes.
    print(f"[Database] [LOG ONLY] Match found on {website} (Email: {email}, Similarity: {similarity_score}%)")
    pass

def update_notice_status(email, website, status):
    # Status updates are handled by the Node service's noticeController
    print(f"[Database] [LOG ONLY] Notice status update for {website} to {status}")
    pass

def get_all_notices():
    # This should now fetch from detected_matches if possible, 
    # but for simplicity we return an empty list as Node handles the dashboard.
    return []

def log_search(image_url):
    print(f"[Database] [LOG ONLY] Search logged: {image_url}")
    pass

def get_search_history():
    return []
