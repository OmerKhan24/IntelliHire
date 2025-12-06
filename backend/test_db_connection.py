"""
Database Connection Test Script
Run this to verify your database connection works
"""
import os
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv
load_dotenv()

def test_database_connection():
    """Test database connection and basic queries"""
    print("=" * 60)
    print("🔍 IntelliHire Database Connection Test")
    print("=" * 60)
    
    try:
        # Import after adding to path
        from app import create_app
        from models.models import db, User, Job, Interview
        
        app = create_app()
        
        with app.app_context():
            # Test 1: Basic connection
            print("\n✅ Test 1: Basic Connection")
            try:
                db.session.execute('SELECT 1')
                print("   ✓ Database connection successful!")
            except Exception as e:
                print(f"   ✗ Connection failed: {e}")
                return False
            
            # Test 2: Check database type
            print("\n✅ Test 2: Database Information")
            database_uri = app.config.get('SQLALCHEMY_DATABASE_URI', '')
            if 'mysql' in database_uri:
                print("   📊 Database Type: MySQL")
            elif 'postgresql' in database_uri:
                print("   📊 Database Type: PostgreSQL")
            else:
                print(f"   📊 Database Type: Unknown ({database_uri[:20]}...)")
            
            # Test 3: Count records
            print("\n✅ Test 3: Table Data")
            try:
                user_count = User.query.count()
                job_count = Job.query.count()
                interview_count = Interview.query.count()
                
                print(f"   👥 Users: {user_count}")
                print(f"   💼 Jobs: {job_count}")
                print(f"   🎤 Interviews: {interview_count}")
            except Exception as e:
                print(f"   ⚠️  Could not count records: {e}")
            
            # Test 4: Sample user query
            print("\n✅ Test 4: Sample Query")
            try:
                users = User.query.limit(3).all()
                if users:
                    print("   Sample users:")
                    for user in users:
                        print(f"   - {user.username} ({user.email}) - Role: {user.role}")
                else:
                    print("   ⚠️  No users found in database")
            except Exception as e:
                print(f"   ⚠️  Query failed: {e}")
            
            print("\n" + "=" * 60)
            print("✅ All tests completed successfully!")
            print("=" * 60)
            return True
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure MySQL/PostgreSQL server is running")
        print("2. Check DATABASE_URL in .env file")
        print("3. Verify database exists and is accessible")
        print("4. Run: pip install -r requirements.txt")
        return False

if __name__ == '__main__':
    success = test_database_connection()
    sys.exit(0 if success else 1)
