-- ═══════════════════════════════════════════════════════
-- IntelliHire — Schema Update v2
-- Client onboarding, sub-accounts, preferences, branding
-- ═══════════════════════════════════════════════════════

-- 1. ALTER leads — add referral_source
ALTER TABLE leads ADD COLUMN referral_source VARCHAR(200) DEFAULT NULL AFTER country;

-- 2. ALTER clients — expand with subscription & branding fields
ALTER TABLE clients
  ADD COLUMN contact_name VARCHAR(150) DEFAULT NULL AFTER company_name,
  ADD COLUMN email VARCHAR(200) DEFAULT NULL AFTER contact_name,
  ADD COLUMN subscription_start DATE DEFAULT NULL AFTER is_active,
  ADD COLUMN subscription_end DATE DEFAULT NULL AFTER subscription_start,
  ADD COLUMN quota_reset_date DATE DEFAULT NULL AFTER subscription_end,
  ADD COLUMN max_sub_accounts INT NOT NULL DEFAULT 3 AFTER quota_reset_date,
  ADD COLUMN logo_url VARCHAR(500) DEFAULT NULL AFTER max_sub_accounts,
  ADD COLUMN notes TEXT DEFAULT NULL AFTER logo_url,
  ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'active' AFTER notes;
  -- status: active | suspended | cancelled

-- 3. ALTER jobs — add client_id FK for multi-tenant
ALTER TABLE jobs
  ADD COLUMN client_id INT DEFAULT NULL AFTER created_by,
  ADD COLUMN logo_url VARCHAR(500) DEFAULT NULL AFTER company_name,
  ADD COLUMN must_ask_questions JSON DEFAULT NULL AFTER logo_url,
  ADD CONSTRAINT fk_jobs_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- 4. Client sub-accounts (team members under a client)
CREATE TABLE IF NOT EXISTS client_sub_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  user_id INT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',  -- owner | admin | member
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_csa_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_csa_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  UNIQUE KEY uq_client_user (client_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Client notification preferences
CREATE TABLE IF NOT EXISTS client_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL UNIQUE,
  notify_quota_80 BOOLEAN NOT NULL DEFAULT TRUE,
  notify_data_deletion BOOLEAN NOT NULL DEFAULT TRUE,
  notify_interview_complete BOOLEAN NOT NULL DEFAULT TRUE,
  data_retention_days INT NOT NULL DEFAULT 90,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cp_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Must-ask questions per job (client-configurable)
CREATE TABLE IF NOT EXISTS must_ask_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  job_id INT DEFAULT NULL,  -- NULL = apply to all jobs for this client
  question_text TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_maq_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_maq_job    FOREIGN KEY (job_id)    REFERENCES jobs(id)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Indexes for performance
CREATE INDEX idx_csa_client ON client_sub_accounts(client_id);
CREATE INDEX idx_csa_user ON client_sub_accounts(user_id);
CREATE INDEX idx_maq_client ON must_ask_questions(client_id);
CREATE INDEX idx_maq_job ON must_ask_questions(job_id);
CREATE INDEX idx_jobs_client ON jobs(client_id);
CREATE INDEX idx_clients_status ON clients(status);
