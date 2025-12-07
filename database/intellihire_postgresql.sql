-- PostgreSQL Database Schema for IntelliHire
-- Converted from MySQL (intellihire_dev)
-- Compatible with Render PostgreSQL

-- NOTE: On Render, the database is already created for you
-- If running locally, create database first:
-- CREATE DATABASE intellihire_dev;
-- Then connect: \c intellihire_dev

-- Set timezone
SET timezone = 'UTC';

-- =====================================================
-- Table: users
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'candidate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cv_url VARCHAR(500),
    full_name VARCHAR(150),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- Table: jobs
-- =====================================================
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    duration_minutes INTEGER,
    created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20),
    scoring_criteria JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Table: interviews
-- =====================================================
CREATE TABLE interviews (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    candidate_name VARCHAR(100),
    candidate_email VARCHAR(100),
    candidate_phone VARCHAR(20),
    cv_file_path VARCHAR(500),
    status VARCHAR(20),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    final_score DOUBLE PRECISION,
    ai_analysis JSONB,
    recording_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cv_monitoring_report JSONB
);

-- =====================================================
-- Table: questions
-- =====================================================
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER NOT NULL REFERENCES interviews(id),
    question TEXT NOT NULL,
    question_type VARCHAR(50),
    difficulty_level VARCHAR(20),
    expected_duration INTEGER,
    order_index INTEGER,
    ai_context JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Table: responses
-- =====================================================
CREATE TABLE responses (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER NOT NULL REFERENCES interviews(id),
    question_id INTEGER NOT NULL REFERENCES questions(id),
    answer_text TEXT,
    answer_audio_url VARCHAR(500),
    answer_video_url VARCHAR(500),
    answer_duration INTEGER,
    voice_analysis_data JSONB,
    confidence_score DOUBLE PRECISION,
    relevance_score DOUBLE PRECISION,
    technical_score DOUBLE PRECISION,
    communication_score DOUBLE PRECISION,
    ai_feedback TEXT,
    detected_emotions JSONB,
    behavioral_flags JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Table: chat_conversations
-- =====================================================
CREATE TABLE chat_conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    title VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Table: chat_messages
-- =====================================================
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    retrieved_chunks INTEGER DEFAULT 0,
    source_documents JSONB,
    intent_analysis JSONB,
    feedback_rating INTEGER,
    feedback_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Table: hr_documents
-- =====================================================
CREATE TABLE hr_documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(20),
    file_size INTEGER,
    document_id VARCHAR(100) NOT NULL UNIQUE,
    uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    tags JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- Jobs indexes
CREATE INDEX idx_jobs_created_by ON jobs(created_by);
CREATE INDEX idx_jobs_status ON jobs(status);

-- Interviews indexes
CREATE INDEX idx_interviews_job_id ON interviews(job_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_candidate_email ON interviews(candidate_email);

-- Questions indexes
CREATE INDEX idx_questions_interview_id ON questions(interview_id);

-- Responses indexes
CREATE INDEX idx_responses_interview_id ON responses(interview_id);
CREATE INDEX idx_responses_question_id ON responses(question_id);

-- Chat conversations indexes
CREATE INDEX idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_session_id ON chat_conversations(session_id);
CREATE INDEX idx_chat_conversations_last_message ON chat_conversations(last_message_at);

-- Chat messages indexes
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_role ON chat_messages(role);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- HR documents indexes
CREATE INDEX idx_hr_documents_category ON hr_documents(category);
CREATE INDEX idx_hr_documents_uploaded_by ON hr_documents(uploaded_by);
CREATE INDEX idx_hr_documents_document_id ON hr_documents(document_id);

-- =====================================================
-- Insert Sample Data (Users)
-- =====================================================

INSERT INTO users (id, username, email, password_hash, role, created_at, full_name, phone, is_active, created_by) VALUES
(4, 'admin', 'admin@gmail.com', 'pbkdf2:sha256:600000$ygBikMsQPSqytIGM$5395f9bf9a3f47f652930f7d283070a327342942a1feefce9b8e755b4f83580d', 'admin', '2025-12-01 18:09:57', NULL, NULL, TRUE, NULL),
(5, 'tech', 'tech@gmail.com', 'pbkdf2:sha256:600000$DjGU7MvDBkoUSfen$bf28b7f4a7c630a64bd6d8a75ce3b1e6dcc599c7fcaf605155251110f4a45f5a', 'interviewer', '2025-12-01 18:15:40', 'Tech Khan', '23333333333333333', TRUE, 4),
(6, 'omer', 'omerkham12345@gmail.com', 'pbkdf2:sha256:600000$66gJihQC$2f0215a3d4096b0f390162a12e0397fa7860881588e239281f6dd190ca70a1a2', 'candidate', '2025-12-01 19:13:41', 'Muhammad Omer Khan', '03331354274', TRUE, NULL),
(7, 'khan', 'khan@gmail.com', 'pbkdf2:sha256:600000$onbiA5WVPOPZ1h8x$5a6752cf53a38fd7102cfad49e55995a737ee93c6ff51a078b8a119b7175a8b4', 'employee', '2025-12-06 22:31:14', 'Khan Pathan', '', TRUE, NULL);

-- Update sequence for users
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- =====================================================
-- Insert Sample Data (Jobs)
-- =====================================================

INSERT INTO jobs (id, title, description, requirements, duration_minutes, created_by, status, scoring_criteria, created_at, updated_at) VALUES
(4, 'Senior Software Engineer', 
'About the Role

We are seeking a passionate and detail-oriented Software Engineer to join our dynamic development team. The ideal candidate will design, develop, and maintain scalable software solutions that align with business goals and deliver exceptional user experiences.

Key Responsibilities

Design, implement, and maintain efficient, reusable, and reliable code.

Participate in the full software development lifecycle, from concept to deployment.

Collaborate with cross-functional teams including UI/UX designers, QA engineers, and product managers.

Identify and fix bugs, optimize application performance, and ensure code quality.

Contribute to architectural decisions and technical discussions.

Stay updated with emerging technologies and propose improvements to enhance development processes.', 
'Required Qualifications

Bachelor''s degree in Computer Science, Software Engineering, or a related field.

Strong programming skills in one or more languages such as Python, Java, C++, or JavaScript.

Experience with web frameworks (e.g., Flask, Django, React, or Node.js).

Knowledge of databases (MySQL, PostgreSQL, MongoDB).

Familiarity with version control systems (Git, GitHub).

Solid understanding of data structures, algorithms, and OOP concepts.

Preferred Skills

Experience with cloud platforms (AWS, Azure, GCP).

Understanding of DevOps tools (Docker, Jenkins, CI/CD pipelines).

Exposure to Agile/Scrum methodologies.

Strong problem-solving and analytical skills.

Excellent teamwork and communication abilities.', 
20, 5, 'active', 
'{"technical_skills": {"weight": 0.4, "description": "Technical knowledge and problem-solving"}, "communication": {"weight": 0.3, "description": "Communication clarity and confidence"}, "behavioral": {"weight": 0.2, "description": "Team fit and professional behavior"}, "experience": {"weight": 0.1, "description": "Relevant experience and background"}}'::jsonb,
'2025-12-01 18:16:56', '2025-12-01 18:16:56');

-- Update sequence for jobs
SELECT setval('jobs_id_seq', (SELECT MAX(id) FROM jobs));

-- =====================================================
-- Update Trigger for updated_at columns
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hr_documents_updated_at BEFORE UPDATE ON hr_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_conversations_last_message BEFORE UPDATE ON chat_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Completion Message
-- =====================================================

DO $$ 
BEGIN 
    RAISE NOTICE '✅ IntelliHire PostgreSQL database schema created successfully!';
    RAISE NOTICE '📊 Tables: users, jobs, interviews, questions, responses, chat_conversations, chat_messages, hr_documents';
    RAISE NOTICE '👤 Sample users created: admin, tech, omer, khan';
    RAISE NOTICE '💼 Sample job created: Senior Software Engineer';
END $$;
