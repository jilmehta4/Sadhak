#!/usr/bin/env python3
"""
Migration script to add authentication and purchase tables to the database
"""

import sqlite3
from pathlib import Path

def run_migration():
    # Path to database
    db_path = Path(__file__).parent / 'data' / 'search.db'
    schema_path = Path(__file__).parent / 'db' / 'schema-auth.sql'
    
    if not db_path.exists():
        print(f"❌ Database not found at {db_path}")
        return False
    
    if not schema_path.exists():
        print(f"❌ Schema file not found at {schema_path}")
        return False
    
    try:
        # Read schema
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Execute schema
        cursor.executescript(schema_sql)
        conn.commit()
        
        # Verify tables were created
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users', 'chat_history', 'user_purchases', 'document_pricing')")
        tables = cursor.fetchall()
        
        conn.close()
        
        print("✅ Migration completed successfully!")
        print(f"   Created tables: {', '.join([t[0] for t in tables])}")
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == '__main__':
    run_migration()
