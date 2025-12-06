# Database Migration Guide

Your IntelliHire app currently uses MySQL locally. For deployment, you have two options:

## Option 1: Migrate MySQL → PostgreSQL (Recommended for Render)

### Step 1: Export Your MySQL Data

```powershell
# Export database structure and data
mysqldump -u root -p intellihire_dev > intellihire_backup.sql
```

Or use phpMyAdmin:
1. Go to phpMyAdmin → `intellihire_dev` database
2. Click **Export** tab
3. Select **Custom** export method
4. Choose **SQL** format
5. Click **Go** to download

### Step 2: Convert MySQL to PostgreSQL

**Option A: Use Online Converter**
- Upload your SQL file to: https://www.sqlines.com/online
- Select: MySQL → PostgreSQL
- Download converted file

**Option B: Manual Conversion** (for key differences)

Replace these MySQL-specific syntax:
```sql
# MySQL → PostgreSQL changes:

# 1. Auto increment
AUTO_INCREMENT → SERIAL

# 2. Backticks
`table_name` → "table_name" or table_name

# 3. Engine
ENGINE=InnoDB → (remove this line)

# 4. Boolean
TINYINT(1) → BOOLEAN

# 5. Datetime defaults
DEFAULT current_timestamp() → DEFAULT CURRENT_TIMESTAMP

# 6. JSON validation
CHECK (json_valid(`column`)) → (remove, PostgreSQL has native JSON)
```

### Step 3: Import to Render PostgreSQL

After deploying your backend on Render:

1. Get PostgreSQL connection details from Render dashboard
2. Connect using psql or pgAdmin:
   ```bash
   psql -h <hostname> -U <username> -d <database>
   ```
3. Import your converted SQL:
   ```bash
   psql -h <hostname> -U <username> -d <database> -f intellihire_postgres.sql
   ```

Or use Render's web shell:
1. Go to your database on Render
2. Click **Connect** → **External Connection**
3. Use provided command to connect
4. Copy-paste your SQL commands

---

## Option 2: Keep MySQL (Use MySQL Hosting)

If you want to keep MySQL without conversion, use these services:

### A. **PlanetScale** (Recommended - MySQL Compatible)

1. Sign up at [planetscale.com](https://planetscale.com)
2. Create a new database
3. Get connection string
4. Update your Render environment variable:
   ```
   DATABASE_URL=mysql://user:pass@host.psdb.cloud/intellihire?sslaccept=strict
   ```

**Pros:**
- Free tier available
- No conversion needed
- Serverless MySQL

### B. **Railway** (Deploy Everything There)

Railway supports MySQL natively:
1. Deploy to Railway instead of Render
2. Add MySQL service
3. Connect automatically

### C. **FreeMySQLHosting** or **db4free**

Free MySQL hosting, but less reliable for production.

---

## Option 3: Dual Setup (Development + Production)

Keep MySQL locally, use PostgreSQL in production:

**Update `config/config.py`:**

```python
import os

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    
    # Auto-detect database type from DATABASE_URL
    database_url = os.environ.get('DATABASE_URL')
    
    if database_url:
        # Production: Use DATABASE_URL (could be MySQL or PostgreSQL)
        if database_url.startswith('postgres://'):
            # Render uses postgres://, SQLAlchemy needs postgresql://
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        SQLALCHEMY_DATABASE_URI = database_url
    else:
        # Development: Use local MySQL
        SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:@localhost/intellihire_dev'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
```

---

## Quick Migration Script (MySQL → PostgreSQL)

Save this as `migrate_db.py` in your backend folder:

```python
import pymysql
import psycopg2
import json
from datetime import datetime

# MySQL connection
mysql_conn = pymysql.connect(
    host='localhost',
    user='root',
    password='',
    database='intellihire_dev'
)

# PostgreSQL connection (update with your Render credentials)
pg_conn = psycopg2.connect(
    host='<render-host>',
    user='<render-user>',
    password='<render-password>',
    database='<render-database>'
)

mysql_cursor = mysql_conn.cursor()
pg_cursor = pg_conn.cursor()

# Migrate users table
print("Migrating users...")
mysql_cursor.execute("SELECT * FROM users")
users = mysql_cursor.fetchall()

for user in users:
    pg_cursor.execute("""
        INSERT INTO users (id, username, email, password_hash, role, created_at, 
                          full_name, phone, is_active, created_by)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id) DO NOTHING
    """, user)

print(f"Migrated {len(users)} users")

# Similar for other tables...

pg_conn.commit()
mysql_cursor.close()
pg_cursor.close()
mysql_conn.close()
pg_conn.close()

print("✅ Migration complete!")
```

---

## Recommended Approach

**For quick deployment:**
1. Use **PlanetScale** (keeps MySQL, no conversion)
2. Export your data from phpMyAdmin
3. Import to PlanetScale
4. Update `DATABASE_URL` in Render

**For production-ready:**
1. Migrate to **PostgreSQL** on Render
2. Use conversion tool or script
3. Test locally with PostgreSQL before deploying

---

## Update Your Code for PostgreSQL Compatibility

If you choose PostgreSQL, update these files:

**requirements.txt:**
```python
# Replace:
PyMySQL==1.1.0

# With:
psycopg2-binary==2.9.9
```

**config/config.py:** (already handles DATABASE_URL)

No other code changes needed - SQLAlchemy handles the rest!

---

## Testing Database Connection

Add this to your backend:

```python
# test_db_connection.py
from app import create_app
from models.models import db

app = create_app()
with app.app_context():
    try:
        db.session.execute('SELECT 1')
        print("✅ Database connected successfully!")
        
        # Test a query
        from models.models import User
        user_count = User.query.count()
        print(f"✅ Found {user_count} users in database")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
```

Run it:
```bash
python test_db_connection.py
```

---

## Need Help?

Choose your path:
- **Fast & Easy**: Use PlanetScale (MySQL hosting)
- **Production Ready**: Migrate to PostgreSQL on Render
- **Hybrid**: Keep MySQL local, use PostgreSQL in production

Let me know which approach you prefer!
