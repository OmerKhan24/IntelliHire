"""
Migration script to add accessed_at column to interviews table
Run this script once to update the database schema
"""
import sys
import os
from sqlalchemy import text

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db

def run_migration():
    """Add accessed_at column to interviews table"""
    with app.app_context():
        try:
            # Check if column already exists
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='interviews' AND column_name='accessed_at'
            """))
            
            if result.fetchone():
                print("✅ Column 'accessed_at' already exists. No migration needed.")
                return
            
            # Add the column
            print("📝 Adding 'accessed_at' column to interviews table...")
            db.session.execute(text("""
                ALTER TABLE interviews 
                ADD COLUMN accessed_at TIMESTAMP NULL
            """))
            db.session.commit()
            print("✅ Migration completed successfully!")
            print("   - Added 'accessed_at' column to interviews table")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Migration failed: {e}")
            raise

if __name__ == '__main__':
    print("🚀 Starting migration...")
    run_migration()
    print("✅ All done!")
