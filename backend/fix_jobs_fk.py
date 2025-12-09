"""
Fix jobs.created_by foreign key constraint
"""
import pymysql

connection = pymysql.connect(
    host='localhost',
    user='root',
    password='',
    database='intellihire_db'
)

try:
    with connection.cursor() as cursor:
        print("🔍 Checking jobs.created_by data...")
        
        # Check current created_by values and type
        cursor.execute("DESCRIBE jobs")
        columns = cursor.fetchall()
        print("\n📊 Current jobs table structure:")
        for col in columns:
            if col[0] == 'created_by':
                print(f"   created_by: {col}")
        
        # Get all jobs with their created_by values
        cursor.execute("SELECT id, title, created_by FROM jobs")
        jobs = cursor.fetchall()
        print(f"\n📋 Found {len(jobs)} jobs:")
        for job in jobs:
            print(f"   Job ID {job[0]}: '{job[1]}' - created_by: {job[2]} (type: {type(job[2])})")
        
        # Get all user IDs
        cursor.execute("SELECT id, username, role FROM users")
        users = cursor.fetchall()
        print(f"\n👥 Found {len(users)} users:")
        for user in users:
            print(f"   User ID {user[0]}: {user[1]} (role: {user[2]})")
        
        if not users:
            print("\n❌ No users found! Create a user first.")
        else:
            # Set all jobs to be created by first user
            first_user_id = users[0][0]
            print(f"\n🔄 Setting all jobs.created_by to user ID {first_user_id}...")
            cursor.execute("UPDATE jobs SET created_by = %s", (first_user_id,))
            print(f"✅ Updated {cursor.rowcount} jobs")
            
            # Now try to add the foreign key
            print("\n🔄 Adding foreign key constraint...")
            try:
                cursor.execute("ALTER TABLE jobs DROP FOREIGN KEY IF EXISTS fk_jobs_created_by")
            except:
                pass
            
            cursor.execute("ALTER TABLE jobs MODIFY COLUMN created_by INT")
            cursor.execute("ALTER TABLE jobs ADD CONSTRAINT fk_jobs_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE")
            print("✅ Foreign key constraint added successfully!")
            
            connection.commit()
            print("\n✅ Migration completed!")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    connection.rollback()
finally:
    connection.close()
