-- ============================================================
-- IntelliHire SaaS Flow — New Tables
-- Run this against intellihire_db after existing schema
-- ============================================================

-- 1. LEADS — landing page "Get Started" submissions
CREATE TABLE IF NOT EXISTS leads (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(150)  NOT NULL,
    job_title       VARCHAR(150),
    company_name    VARCHAR(200)  NOT NULL,
    company_size    VARCHAR(50),          -- e.g. '1-10', '11-50', '51-200', '201-500', '500+'
    industry        VARCHAR(100),
    work_email      VARCHAR(200)  NOT NULL,
    phone           VARCHAR(30)   NOT NULL,
    country         VARCHAR(100),
    message         TEXT,
    selected_plan   VARCHAR(50)   NOT NULL,  -- 'starter', 'professional', 'enterprise'
    status          VARCHAR(30)   NOT NULL DEFAULT 'new',
    -- new → contacted → confirmed → converted → lost
    admin_notes     TEXT,
    contacted_at    DATETIME,
    confirmed_at    DATETIME,
    converted_at    DATETIME,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_leads_status (status),
    INDEX idx_leads_email  (work_email),
    INDEX idx_leads_plan   (selected_plan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 2. CLIENTS — confirmed leads turned into active accounts
CREATE TABLE IF NOT EXISTS clients (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    lead_id         INT           NOT NULL,
    user_id         INT           NOT NULL,   -- FK → users.id (the login account)
    company_name    VARCHAR(200)  NOT NULL,
    tier            VARCHAR(50)   NOT NULL,    -- 'starter', 'professional', 'enterprise'
    interview_quota INT           NOT NULL DEFAULT 0,
    interviews_used INT           NOT NULL DEFAULT 0,
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    activated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deactivated_at  DATETIME,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (lead_id) REFERENCES leads(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_clients_user (user_id),
    INDEX idx_clients_tier (tier),
    INDEX idx_clients_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 3. PAYMENTS — all money collected
CREATE TABLE IF NOT EXISTS payments (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    client_id       INT           NOT NULL,
    amount          DECIMAL(10,2) NOT NULL,
    currency        VARCHAR(10)   NOT NULL DEFAULT 'USD',
    payment_method  VARCHAR(50),             -- 'stripe', 'bank_transfer', 'manual'
    payment_ref     VARCHAR(200),            -- external reference / Stripe ID
    status          VARCHAR(30)   NOT NULL DEFAULT 'pending',
    -- pending → completed → failed → refunded
    description     TEXT,
    paid_at         DATETIME,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id) REFERENCES clients(id),
    INDEX idx_payments_client (client_id),
    INDEX idx_payments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 4. REFUNDS — manual refund processing
CREATE TABLE IF NOT EXISTS refunds (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    payment_id      INT           NOT NULL,
    client_id       INT           NOT NULL,
    amount          DECIMAL(10,2) NOT NULL,
    reason          TEXT          NOT NULL,
    status          VARCHAR(30)   NOT NULL DEFAULT 'pending',
    -- pending → approved → processed → rejected
    processed_by    INT,                      -- admin user_id
    processed_at    DATETIME,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (payment_id) REFERENCES payments(id),
    FOREIGN KEY (client_id)  REFERENCES clients(id),
    FOREIGN KEY (processed_by) REFERENCES users(id),
    INDEX idx_refunds_client (client_id),
    INDEX idx_refunds_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 5. AUDIT LOGS — every admin action
CREATE TABLE IF NOT EXISTS audit_logs (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT           NOT NULL,
    action          VARCHAR(100)  NOT NULL,   -- 'lead.confirm', 'client.update_quota', 'refund.process' etc
    entity_type     VARCHAR(50),              -- 'lead', 'client', 'payment', 'refund', 'setting'
    entity_id       INT,
    details         JSON,                     -- arbitrary payload
    ip_address      VARCHAR(45),
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_audit_user   (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_time   (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 6. ANNOUNCEMENTS — system-wide messages
CREATE TABLE IF NOT EXISTS announcements (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(300)  NOT NULL,
    content         TEXT          NOT NULL,
    type            VARCHAR(30)   NOT NULL DEFAULT 'info',
    -- info, warning, maintenance, update
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    target_audience VARCHAR(30)   NOT NULL DEFAULT 'all',
    -- all, clients, admins
    created_by      INT           NOT NULL,
    expires_at      DATETIME,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_announce_active (is_active, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 7. SYSTEM SETTINGS — key-value config store
CREATE TABLE IF NOT EXISTS system_settings (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    setting_key     VARCHAR(100)  NOT NULL UNIQUE,
    setting_value   TEXT          NOT NULL,
    updated_by      INT,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default system settings
INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES
    ('maintenance_mode', 'false'),
    ('pause_new_interviews', 'false'),
    ('pause_new_signups', 'false'),
    ('system_alert_message', '');
