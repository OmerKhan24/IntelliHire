-- ============================================================
-- IntelliHire Product Schema
-- Run against: intellihire_db (MySQL / MariaDB via XAMPP)
-- ============================================================
-- This script:
--   1. ALTERs existing tables (jobs, interviews) for the product flow
--   2. Creates new tables for applications, scheduling, email, etc.
--   3. Is idempotent — uses IF NOT EXISTS / IF NOT EXISTS column checks
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ────────────────────────────────────────────────────────────
-- 0. EXISTING TABLES (no changes — listed for reference)
-- ────────────────────────────────────────────────────────────
-- users, questions, responses, hr_documents,
-- chat_conversations, chat_messages, candidate_reports
-- (already created by SQLAlchemy db.create_all)

-- ────────────────────────────────────────────────────────────
-- 1. ALTER  jobs  — add product-flow columns
-- ────────────────────────────────────────────────────────────
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS share_token        VARCHAR(64)  UNIQUE          AFTER scoring_criteria,
  ADD COLUMN IF NOT EXISTS max_shortlist       INT          DEFAULT 5       AFTER share_token,
  ADD COLUMN IF NOT EXISTS application_deadline DATETIME    NULL            AFTER max_shortlist,
  ADD COLUMN IF NOT EXISTS is_published        TINYINT(1)   DEFAULT 0       AFTER application_deadline,
  ADD COLUMN IF NOT EXISTS auto_schedule       TINYINT(1)   DEFAULT 0       AFTER is_published,
  ADD COLUMN IF NOT EXISTS company_name        VARCHAR(200) NULL            AFTER auto_schedule,
  ADD COLUMN IF NOT EXISTS location            VARCHAR(200) NULL            AFTER company_name,
  ADD COLUMN IF NOT EXISTS job_type            VARCHAR(50)  DEFAULT 'full_time' AFTER location,
  ADD COLUMN IF NOT EXISTS salary_range        VARCHAR(100) NULL            AFTER job_type,
  ADD COLUMN IF NOT EXISTS total_applications  INT          DEFAULT 0       AFTER salary_range;

-- ────────────────────────────────────────────────────────────
-- 2. ALTER  interviews  — link to application
-- ────────────────────────────────────────────────────────────
ALTER TABLE interviews
  ADD COLUMN IF NOT EXISTS application_id INT NULL AFTER job_id;

-- FK will be added after candidate_applications table exists
-- (handled below)

-- ────────────────────────────────────────────────────────────
-- 3. NEW TABLE: candidate_applications
--    Tracks every candidate who applies to a job.
--    The ATS scorer writes ats_score + ats_breakdown here.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidate_applications (
  id                INT           AUTO_INCREMENT PRIMARY KEY,
  job_id            INT           NOT NULL,
  candidate_id      INT           NULL,          -- FK → users (NULL if guest)
  candidate_name    VARCHAR(150)  NOT NULL,
  candidate_email   VARCHAR(150)  NOT NULL,
  candidate_phone   VARCHAR(30)   NULL,
  cv_file_path      VARCHAR(500)  NULL,
  cv_text           MEDIUMTEXT    NULL,          -- extracted text for ATS
  ats_score         FLOAT         NULL,          -- 0-100
  ats_breakdown     JSON          NULL,          -- {relevance, skills_match, experience, education, …}
  status            VARCHAR(30)   NOT NULL DEFAULT 'applied',
                    -- applied → scoring → shortlisted / rejected → scheduled → interviewed → hired / archived
  rejection_reason  TEXT          NULL,
  applied_at        DATETIME      DEFAULT CURRENT_TIMESTAMP,
  scored_at         DATETIME      NULL,
  shortlisted_at    DATETIME      NULL,
  created_at        DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_app_job       FOREIGN KEY (job_id)        REFERENCES jobs(id)  ON DELETE CASCADE,
  CONSTRAINT fk_app_candidate FOREIGN KEY (candidate_id)  REFERENCES users(id) ON DELETE SET NULL,

  -- one application per email per job
  UNIQUE KEY uq_job_email (job_id, candidate_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Now add the FK on interviews.application_id
-- (safe to fail if already exists)
-- ALTER TABLE interviews
--   ADD CONSTRAINT fk_interview_application
--   FOREIGN KEY (application_id) REFERENCES candidate_applications(id)
--   ON DELETE SET NULL;

-- ────────────────────────────────────────────────────────────
-- 4. NEW TABLE: interview_schedules
--    One row per scheduled interview for a shortlisted candidate.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_schedules (
  id                  INT           AUTO_INCREMENT PRIMARY KEY,
  interview_id        INT           NOT NULL,
  application_id      INT           NOT NULL,
  scheduled_at        DATETIME      NOT NULL,
  duration_minutes    INT           DEFAULT 30,
  timezone            VARCHAR(50)   DEFAULT 'UTC',
  meeting_link        VARCHAR(500)  NULL,           -- generated /interview/:jobId link
  status              VARCHAR(30)   NOT NULL DEFAULT 'scheduled',
                      -- scheduled → reminded → in_progress → completed → cancelled → no_show
  invitation_sent_at  DATETIME      NULL,
  reminder_sent_at    DATETIME      NULL,
  completed_at        DATETIME      NULL,
  cancelled_at        DATETIME      NULL,
  cancellation_reason TEXT          NULL,
  created_at          DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_sched_interview    FOREIGN KEY (interview_id)   REFERENCES interviews(id)              ON DELETE CASCADE,
  CONSTRAINT fk_sched_application  FOREIGN KEY (application_id) REFERENCES candidate_applications(id)  ON DELETE CASCADE,

  UNIQUE KEY uq_sched_interview (interview_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 5. NEW TABLE: email_logs
--    Audit trail for every email the system sends.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_logs (
  id                    INT           AUTO_INCREMENT PRIMARY KEY,
  recipient_email       VARCHAR(200)  NOT NULL,
  recipient_name        VARCHAR(200)  NULL,
  email_type            VARCHAR(50)   NOT NULL,
                        -- application_received, ats_complete, shortlisted, rejected,
                        -- interview_invite, interview_reminder, interview_completed,
                        -- report_ready, custom
  subject               VARCHAR(500)  NOT NULL,
  body_html             MEDIUMTEXT    NULL,
  status                VARCHAR(20)   NOT NULL DEFAULT 'pending',
                        -- pending → sent → failed → bounced
  related_job_id        INT           NULL,
  related_application_id INT          NULL,
  error_message         TEXT          NULL,
  sent_at               DATETIME      NULL,
  created_at            DATETIME      DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_email_type   (email_type),
  INDEX idx_email_status (status),
  INDEX idx_email_job    (related_job_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 6. NEW TABLE: notifications  (in-app)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  user_id       INT           NOT NULL,
  title         VARCHAR(200)  NOT NULL,
  message       TEXT          NOT NULL,
  type          VARCHAR(50)   NOT NULL DEFAULT 'info',
                -- info, success, warning, error, application, interview, report
  is_read       TINYINT(1)    DEFAULT 0,
  link          VARCHAR(500)  NULL,           -- deep link within the app
  related_job_id INT          NULL,
  related_application_id INT  NULL,
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user_read (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 7. INDEXES for performance
-- ────────────────────────────────────────────────────────────
-- candidate_applications
CREATE INDEX IF NOT EXISTS idx_app_job_status     ON candidate_applications(job_id, status);
CREATE INDEX IF NOT EXISTS idx_app_email          ON candidate_applications(candidate_email);
CREATE INDEX IF NOT EXISTS idx_app_ats_score      ON candidate_applications(job_id, ats_score DESC);

-- interview_schedules
CREATE INDEX IF NOT EXISTS idx_sched_date         ON interview_schedules(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sched_status       ON interview_schedules(status);

-- jobs
CREATE INDEX IF NOT EXISTS idx_jobs_share_token   ON jobs(share_token);
CREATE INDEX IF NOT EXISTS idx_jobs_published     ON jobs(is_published, status);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- PRODUCT FLOW SUMMARY
-- ============================================================
-- 1. Interviewer creates Job  → share_token auto-generated
-- 2. Interviewer publishes Job (is_published = 1)
-- 3. Candidate visits /apply/:share_token → sees job page
-- 4. Candidate fills form + uploads CV
--      → INSERT candidate_applications (status = 'applied')
--      → CV text extracted, stored in cv_text
-- 5. Interviewer triggers ATS scoring (or auto after deadline)
--      → DeepSeek scores each CV against job requirements
--      → UPDATE ats_score, ats_breakdown, status = 'scoring' → 'scored'
-- 6. System shortlists top N (max_shortlist)
--      → UPDATE status = 'shortlisted' for top N
--      → UPDATE status = 'rejected' for rest
--      → DELETE rejected CV files (optional)
-- 7. System creates Interview + InterviewSchedule for each shortlisted
--      → Sends email with interview link + schedule
-- 8. Candidate takes interview (existing flow)
-- 9. Interview completes → system generates CandidateReport
-- 10. Interviewer views reports, compares candidates
-- ============================================================
