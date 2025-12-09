-- Migration to support Employee role in IntelliHire
-- This adds the 'employee' role option to the system
-- Run this script to update your database after the code changes

-- Note: The role column in users table already supports employee role
-- This migration is just for reference and to optionally update data

-- Optional: If you want to rename 'interviewer' display to 'hr' in UI only,
-- the backend will continue to use 'interviewer' as the role value

-- The system now supports 4 roles:
-- 1. 'admin' - System administrators
-- 2. 'interviewer' - HR officials (displayed as "HR" in UI)
-- 3. 'employee' - Company employees who can access HR chatbot
-- 4. 'candidate' - Job applicants who attend interviews

-- Example: Create a test employee (optional)
-- INSERT INTO users (username, email, password_hash, full_name, role, is_active, created_at)
-- VALUES (
--   'test_employee',
--   'employee@company.com',
--   'scrypt:32768:8:1$...',  -- Use proper password hash
--   'Test Employee',
--   'employee',
--   TRUE,
--   NOW()
-- );

-- Verify role options are working
SELECT DISTINCT role FROM users ORDER BY role;

-- Expected output:
-- admin
-- candidate
-- employee (if any registered)
-- interviewer
