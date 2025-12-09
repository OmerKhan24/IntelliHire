-- Add role-based access control fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by INT;
ALTER TABLE users ADD CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Update role column to support admin role (if needed)
ALTER TABLE users MODIFY COLUMN role VARCHAR(32) NOT NULL DEFAULT 'candidate';

-- Update jobs table created_by to be INT (user ID) instead of VARCHAR
-- First, backup existing data if needed, then modify
ALTER TABLE jobs MODIFY COLUMN created_by INT;
ALTER TABLE jobs ADD CONSTRAINT fk_jobs_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

-- Update existing admin role if exists
UPDATE users SET role = 'admin' WHERE role = 'interviewer' AND id = (SELECT MIN(id) FROM users WHERE role = 'interviewer');
