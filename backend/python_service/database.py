import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'notices.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            website_url TEXT,
            original_image_url TEXT,
            copied_image_url TEXT,
            notice_status INTEGER DEFAULT 0
            -- 0 = Not Sent, 1 = First Notice Sent, 2 = Second Notice Sent
        )
    ''')
    
    # Safe migration: rename old column and add new column
    cursor.execute("PRAGMA table_info(notices)")
    columns = [info[1] for info in cursor.fetchall()]
    
    if 'image_url' in columns and 'original_image_url' not in columns:
        try:
            cursor.execute("ALTER TABLE notices RENAME COLUMN image_url TO original_image_url")
        except sqlite3.OperationalError:
            pass
            
    if 'copied_image_url' not in columns:
        try:
            cursor.execute("ALTER TABLE notices ADD COLUMN copied_image_url TEXT")
        except sqlite3.OperationalError:
            pass

    conn.commit()
    conn.close()

def save_email(email, website_url, original_image_url, copied_image_url, status=0):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Check if exists to avoid duplicates
    cursor.execute('SELECT id FROM notices WHERE email = ? AND website_url = ?', (email, website_url))
    if not cursor.fetchone():
        cursor.execute('''
            INSERT INTO notices (email, website_url, original_image_url, copied_image_url, notice_status)
            VALUES (?, ?, ?, ?, ?)
        ''', (email, website_url, original_image_url, copied_image_url, status))
    conn.commit()
    conn.close()

def update_notice_status(email, website_url, status):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE notices SET notice_status = ? WHERE email = ? AND website_url = ?
    ''', (status, email, website_url))
    conn.commit()
    conn.close()
