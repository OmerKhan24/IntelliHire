"""
Run database migration for RBAC fields
"""
import pymysql
from dotenv import load_dotenv
import os

load_dotenv()

# Database connection
connection = pymysql.connect(
    host='localhost',
    user='root',
    password='',
    database='intellihire_db'
)

try:
    with connection.cursor() as cursor:
        print("🔄 Running RBAC migration...")
        
        # Add columns to users table
        migrations = [
            "ALTER TABLE users ADD COLUMN full_name VARCHAR(150)",
            "ALTER TABLE users ADD COLUMN phone VARCHAR(20)",
            "ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE",
            "ALTER TABLE users ADD COLUMN created_by INT",
            "ALTER TABLE users MODIFY COLUMN role VARCHAR(32) NOT NULL DEFAULT 'candidate'",
        ]
        
        for sql in migrations:
            try:
                cursor.execute(sql)
                print(f"✅ {sql[:50]}...")
            except Exception as e:
                if "Duplicate column name" in str(e) or "duplicate key name" in str(e).lower():
                    print(f"⚠️  Column already exists, skipping: {sql[:50]}...")
                else:
                    print(f"❌ Error: {e}")
        
        # Add foreign keys
        fk_migrations = [
            "ALTER TABLE users ADD CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL",
            "ALTER TABLE jobs MODIFY COLUMN created_by INT",
            "ALTER TABLE jobs ADD CONSTRAINT fk_jobs_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE",
        ]
        
        for sql in fk_migrations:
            try:
                cursor.execute(sql)
                print(f"✅ {sql[:60]}...")
            except Exception as e:
                if "duplicate key name" in str(e).lower() or "Duplicate key name" in str(e):
                    print(f"⚠️  Foreign key already exists, skipping: {sql[:50]}...")
                else:
                    print(f"⚠️  FK Error (may be ok): {e}")
        
        connection.commit()
        print("\n✅ Migration completed successfully!")
        
except Exception as e:
    print(f"❌ Migration failed: {e}")
    connection.rollback()
finally:
    connection.close()
