"""
Update existing users with default RBAC field values
"""
import pymysql

connection = pymysql.connect(
    host='localhost',
    user='root',
    password='',
    database='intellihire_dev'
)

try:
    with connection.cursor() as cursor:
        print("🔄 Updating existing users with RBAC defaults...")
        
        # Set default values for existing users
        cursor.execute("UPDATE users SET is_active = TRUE WHERE is_active IS NULL")
        print(f"✅ Set is_active=TRUE for {cursor.rowcount} users")
        
        cursor.execute("UPDATE users SET role = 'candidate' WHERE role IS NULL OR role = ''")
        print(f"✅ Set default role for {cursor.rowcount} users")
        
        # Show all users
        cursor.execute("SELECT id, username, email, role, is_active, full_name FROM users")
        users = cursor.fetchall()
        print(f"\n👥 Current users in database:")
        for user in users:
            print(f"   ID: {user[0]}, Username: {user[1]}, Email: {user[2]}, Role: {user[3]}, Active: {user[4]}, Name: {user[5]}")
        
        connection.commit()
        print("\n✅ Update completed!")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    connection.rollback()
finally:
    connection.close()
