"""
Database Migration: Add Follow-up Question Support
Adds parent_question_id and is_followup columns to questions table

Run this script to update your database:
    python add_followup_columns.py
"""
import pymysql
import os

def run_migration():
    """Add columns to questions table for follow-up question support"""
    
    # Database connection from environment or defaults
    db_config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', ''),
        'database': os.getenv('DB_NAME', 'intellihire_db'),
        'port': int(os.getenv('DB_PORT', 3306)),
        'charset': 'utf8mb4',
        'cursorclass': pymysql.cursors.DictCursor
    }
    
    print("🔄 Starting database migration for follow-up questions...")
    print(f"📊 Connecting to database: {db_config['database']} at {db_config['host']}")
    
    try:
        connection = pymysql.connect(**db_config)
        
        with connection.cursor() as cursor:
            # Check if columns already exist
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = %s 
                AND TABLE_NAME = 'questions'
            """, (db_config['database'],))
            
            existing_columns = [row['COLUMN_NAME'] for row in cursor.fetchall()]
            print(f"📋 Existing columns: {existing_columns}")
            
            migrations_applied = 0
            
            # Add parent_question_id column
            if 'parent_question_id' not in existing_columns:
                print("➕ Adding parent_question_id column...")
                cursor.execute("""
                    ALTER TABLE questions 
                    ADD COLUMN parent_question_id INT NULL,
                    ADD FOREIGN KEY (parent_question_id) REFERENCES questions(id) ON DELETE SET NULL
                """)
                migrations_applied += 1
                print("✅ parent_question_id column added")
            else:
                print("✓ parent_question_id column already exists")
            
            # Add is_followup column
            if 'is_followup' not in existing_columns:
                print("➕ Adding is_followup column...")
                cursor.execute("""
                    ALTER TABLE questions 
                    ADD COLUMN is_followup BOOLEAN DEFAULT FALSE
                """)
                migrations_applied += 1
                print("✅ is_followup column added")
            else:
                print("✓ is_followup column already exists")
            
            if migrations_applied > 0:
                connection.commit()
                print(f"\n🎉 Migration completed! Applied {migrations_applied} changes.")
            else:
                print("\n✓ No migration needed - database is up to date")
                
    except pymysql.Error as e:
        print(f"\n❌ Migration failed: {e}")
        print("Please ensure:")
        print("  1. XAMPP MySQL is running")
        print("  2. Database credentials are correct")
        print("  3. You have ALTER TABLE permissions")
        return False
        
    finally:
        if 'connection' in locals():
            connection.close()
            print("🔌 Database connection closed")
    
    return True


if __name__ == '__main__':
    print("=" * 60)
    print("  Follow-up Question Support Migration")
    print("=" * 60)
    
    success = run_migration()
    
    if success:
        print("\n✅ Database is ready for dynamic follow-up questions!")
        print("You can now:")
        print("  • Generate intelligent follow-up questions based on responses")
        print("  • Track which questions are follow-ups")
        print("  • Link follow-ups to their parent questions")
    else:
        print("\n❌ Migration failed. Please fix the errors and try again.")
