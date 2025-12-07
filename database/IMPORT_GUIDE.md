# Quick PostgreSQL Import Guide

## File Created: `intellihire_postgresql.sql`

This is your MySQL database converted to PostgreSQL format, ready for Render deployment.

## What's Included:

✅ **All 8 Tables:**
- users
- jobs  
- interviews
- questions
- responses
- chat_conversations
- chat_messages
- hr_documents

✅ **Sample Data:**
- 4 users (admin, tech, omer, khan) with passwords
- 1 job posting (Senior Software Engineer)

✅ **PostgreSQL Features:**
- SERIAL (auto-increment)
- JSONB (better than JSON)
- BOOLEAN (instead of TINYINT)
- Proper foreign keys
- Indexes for performance
- Auto-update triggers for `updated_at`

## How to Import to Render:

### Important: Database Name on Render

**On Render:** The database is automatically created with a name like `intellihire` (you choose this during setup). You don't need to create it - Render does it for you.

**Locally (Optional):** If testing PostgreSQL locally:
```bash
# Create database
psql -U postgres
CREATE DATABASE intellihire_dev;
\c intellihire_dev
\i /path/to/intellihire_postgresql.sql
```

### Method 1: Render Web Shell (Easiest)

1. Deploy your backend to Render first
2. Create PostgreSQL database on Render
3. Go to your database on Render dashboard
4. Click **"Connect"** → **"External Connection"**
5. Copy the `psql` command (looks like):
   ```bash
   PGPASSWORD=xyz123 psql -h dpg-xxx.oregon-postgres.render.com -U intellihire_user intellihire
   ```
6. Open your terminal and paste the command
7. Once connected, run:
   ```sql
   \i /path/to/intellihire_postgresql.sql
   ```
   
   Or copy-paste the entire SQL file content into the terminal

### Method 2: pgAdmin (GUI)

1. Download [pgAdmin](https://www.pgadmin.org/download/)
2. Add new server with Render's connection details
3. Right-click database → **Query Tool**
4. Open `intellihire_postgresql.sql` file
5. Click **Execute** (▶️ button)

### Method 3: Python Script

```python
import psycopg2
import os

# Get DATABASE_URL from Render
database_url = "your-render-database-url-here"

conn = psycopg2.connect(database_url)
cursor = conn.cursor()

# Read and execute SQL file
with open('database/intellihire_postgresql.sql', 'r') as f:
    sql = f.read()
    cursor.execute(sql)

conn.commit()
cursor.close()
conn.close()

print("✅ Database imported successfully!")
```

## After Import:

### Test Your Connection:

```bash
cd backend
python test_db_connection.py
```

Expected output:
```
✅ Test 1: Basic Connection
   ✓ Database connection successful!

✅ Test 2: Database Information
   📊 Database Type: PostgreSQL

✅ Test 3: Table Data
   👥 Users: 4
   💼 Jobs: 1
   🎤 Interviews: 0
```

### Default Login Credentials:

```
Admin:
  Email: admin@gmail.com
  Password: admin123 (you'll need to create this user again or use existing hash)

Interviewer:
  Email: tech@gmail.com
  Password: tech123 (existing hash included)

Candidate:
  Email: omerkham12345@gmail.com
  Password: (existing hash included)
```

## Important Notes:

⚠️ **Interview Data Not Included**
- The SQL includes only structure for interviews/questions/responses
- Your existing interview records are in MySQL export but quite large
- Start fresh or manually migrate specific records if needed

⚠️ **File Paths**
- Update file paths in `hr_documents` table after import
- Windows paths (`F:\...`) won't work on Render (Linux)
- Use relative paths: `uploads/hr_documents/...`

⚠️ **Sequences**
- Auto-increment sequences are set correctly
- New records will start from ID 8 (users), 5 (jobs), etc.

## Troubleshooting:

### Error: "relation already exists"
```sql
-- Drop all tables first:
DROP TABLE IF EXISTS responses, questions, interviews, jobs, 
                     chat_messages, chat_conversations, 
                     hr_documents, users CASCADE;
```

### Error: "permission denied"
- Make sure you're connected as the database owner
- Render provides full permissions automatically

### Error: "syntax error"
- PostgreSQL is case-sensitive for identifiers in quotes
- This SQL file handles it correctly

## Next Steps:

1. ✅ Import this SQL to Render PostgreSQL
2. ✅ Deploy backend with `DATABASE_URL` set
3. ✅ Test connection with `test_db_connection.py`
4. ✅ Update `.env` locally to test PostgreSQL
5. ✅ Deploy frontend with backend API URL

---

**Need help?** Check `DATABASE_MIGRATION.md` for detailed migration guide!
