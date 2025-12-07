-- PostgreSQL Database Schema for IntelliHire
-- Compatible with Render PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
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

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- JOBS TABLE
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

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_by ON jobs(created_by);

-- =====================================================
-- INTERVIEWS TABLE
-- =====================================================
CREATE TABLE interviews (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_name VARCHAR(100),
    candidate_email VARCHAR(100),
    candidate_phone VARCHAR(20),
    cv_file_path VARCHAR(500),
    status VARCHAR(20),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    final_score REAL,
    ai_analysis JSONB,
    recording_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cv_monitoring_report JSONB
);

CREATE INDEX idx_interviews_job_id ON interviews(job_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_candidate_email ON interviews(candidate_email);

-- =====================================================
-- QUESTIONS TABLE
-- =====================================================
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type VARCHAR(50),
    difficulty_level VARCHAR(20),
    expected_duration INTEGER,
    order_index INTEGER,
    ai_context JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_interview_id ON questions(interview_id);
CREATE INDEX idx_questions_order ON questions(interview_id, order_index);

-- =====================================================
-- RESPONSES TABLE
-- =====================================================
CREATE TABLE responses (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer_text TEXT,
    answer_audio_url VARCHAR(500),
    answer_video_url VARCHAR(500),
    answer_duration INTEGER,
    voice_analysis_data JSONB,
    confidence_score REAL,
    relevance_score REAL,
    technical_score REAL,
    communication_score REAL,
    ai_feedback TEXT,
    detected_emotions JSONB,
    behavioral_flags JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_responses_interview_id ON responses(interview_id);
CREATE INDEX idx_responses_question_id ON responses(question_id);

-- =====================================================
-- HR DOCUMENTS TABLE
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
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hr_documents_category ON hr_documents(category);
CREATE INDEX idx_hr_documents_document_id ON hr_documents(document_id);
CREATE INDEX idx_hr_documents_uploaded_by ON hr_documents(uploaded_by);
CREATE INDEX idx_hr_documents_created_at ON hr_documents(created_at);

-- Add comment for category field
COMMENT ON COLUMN hr_documents.category IS 'policy, procedure, benefits, onboarding, general';

-- =====================================================
-- CHAT CONVERSATIONS TABLE
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

CREATE INDEX idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_session_id ON chat_conversations(session_id);
CREATE INDEX idx_chat_conversations_last_message ON chat_conversations(last_message_at);

COMMENT ON COLUMN chat_conversations.session_id IS 'UUID for grouping messages';
COMMENT ON COLUMN chat_conversations.title IS 'Auto-generated or user-set conversation title';

-- =====================================================
-- CHAT MESSAGES TABLE
-- =====================================================
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    retrieved_chunks INTEGER DEFAULT 0,
    source_documents JSONB,
    intent_analysis JSONB,
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    feedback_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_role ON chat_messages(role);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_feedback_rating ON chat_messages(feedback_rating);

COMMENT ON COLUMN chat_messages.role IS 'user or assistant';
COMMENT ON COLUMN chat_messages.retrieved_chunks IS 'Number of document chunks retrieved for this message';
COMMENT ON COLUMN chat_messages.source_documents IS 'Referenced documents with metadata';
COMMENT ON COLUMN chat_messages.intent_analysis IS 'Detected intent and categories';
COMMENT ON COLUMN chat_messages.feedback_rating IS 'User rating: 1-5';

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to jobs table
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to interviews table
CREATE TRIGGER update_interviews_updated_at
    BEFORE UPDATE ON interviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to hr_documents table
CREATE TRIGGER update_hr_documents_updated_at
    BEFORE UPDATE ON hr_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update last_message_at in chat_conversations
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_conversations
    SET last_message_at = CURRENT_TIMESTAMP
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_timestamp
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert admin user
INSERT INTO users (username, email, password_hash, role, full_name, created_at)
VALUES 
    ('admin', 'admin@intellihire.com', 'pbkdf2:sha256:600000$ygBikMsQPSqytIGM$5395f9bf9a3f47f652930f7d283070a327342942a1feefce9b8e755b4f83580d', 'admin', 'System Administrator', CURRENT_TIMESTAMP);

-- Note: Additional sample data can be inserted as needed
-- The password hashes in your MySQL dump should work with Flask-Security

-- =====================================================
-- VIEWS (Optional but useful)
-- =====================================================

-- View for interview statistics
CREATE OR REPLACE VIEW interview_statistics AS
SELECT 
    i.id,
    i.job_id,
    j.title as job_title,
    i.candidate_name,
    i.candidate_email,
    i.status,
    i.final_score,
    COUNT(DISTINCT q.id) as total_questions,
    COUNT(DISTINCT r.id) as total_responses,
    AVG(r.confidence_score) as avg_confidence,
    AVG(r.relevance_score) as avg_relevance,
    AVG(r.technical_score) as avg_technical,
    AVG(r.communication_score) as avg_communication,
    i.started_at,
    i.completed_at,
    EXTRACT(EPOCH FROM (i.completed_at - i.started_at))/60 as duration_minutes
FROM interviews i
LEFT JOIN jobs j ON i.job_id = j.id
LEFT JOIN questions q ON q.interview_id = i.id
LEFT JOIN responses r ON r.interview_id = i.id
GROUP BY i.id, j.title;

-- View for HR document statistics
CREATE OR REPLACE VIEW hr_document_stats AS
SELECT 
    category,
    COUNT(*) as document_count,
    SUM(file_size) as total_size_bytes,
    AVG(file_size) as avg_size_bytes,
    array_agg(DISTINCT file_type) as file_types
FROM hr_documents
WHERE is_active = TRUE
GROUP BY category;

-- =====================================================
-- GRANT PERMISSIONS (if needed for specific user)
-- =====================================================
-- Run these if you need to grant permissions to a specific database user
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_db_user;

COMMENT ON DATABASE current_database() IS 'IntelliHire - AI-Powered Interview Platform';