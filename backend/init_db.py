"""
Database initialization script
Creates the database and all tables
"""
import pymysql
from app import create_app
from models.models import db

def create_database():
    """Create the database if it doesn't exist"""
    # Connect to MySQL server (without specifying database)
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password=''
    )
    
    try:
        with connection.cursor() as cursor:
            # Create database
            cursor.execute("CREATE DATABASE IF NOT EXISTS intellihire_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print("✅ Database 'intellihire_dev' created or already exists")
        connection.commit()
    finally:
        connection.close()

def create_tables():
    """Create all tables"""
    app = create_app()
    
    with app.app_context():
        # Drop all tables (use with caution!)
        # db.drop_all()
        
        # Create all tables
        db.create_all()
        print("✅ All database tables created successfully")
        
        # Print table names
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"\n📋 Created tables: {', '.join(tables)}")

if __name__ == '__main__':
    print("🚀 Initializing IntelliHire Database...\n")
    
    try:
        # Step 1: Create database
        create_database()
        
        # Step 2: Create tables
        create_tables()
        
        print("\n✅ Database initialization complete!")
        print("🎯 You can now start the Flask server")
        
    except Exception as e:
        print(f"\n❌ Error during initialization: {e}")
        print("\n💡 Make sure XAMPP MySQL is running!")
