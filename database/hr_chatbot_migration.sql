-- HR Chatbot Module - Database Migration Script
-- Run this in phpMyAdmin or MySQL client to add new tables

-- NOTE: Update database name if needed (default: intellihire_dev)
USE intellihire_dev;

-- HR Documents Table
CREATE TABLE IF NOT EXISTS hr_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL COMMENT 'policy, procedure, benefits, onboarding, general',
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(20) COMMENT 'pdf, docx, txt',
    file_size INT COMMENT 'File size in bytes',
    document_id VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique ID for vector DB reference',
    uploaded_by INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    version INT DEFAULT 1,
    tags JSON COMMENT 'Array of tags for categorization',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (category),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_document_id (document_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat Conversations Table
CREATE TABLE IF NOT EXISTS chat_conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_id VARCHAR(100) NOT NULL COMMENT 'UUID for grouping messages',
    title VARCHAR(200) COMMENT 'Auto-generated or user-set conversation title',
    is_active BOOLEAN DEFAULT TRUE,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_last_message_at (last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    role VARCHAR(20) NOT NULL COMMENT 'user or assistant',
    content TEXT NOT NULL,
    retrieved_chunks INT DEFAULT 0 COMMENT 'Number of document chunks retrieved for this message',
    source_documents JSON COMMENT 'Referenced documents with metadata',
    intent_analysis JSON COMMENT 'Detected intent and categories',
    feedback_rating INT COMMENT 'User rating: 1-5',
    feedback_comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at),
    INDEX idx_feedback_rating (feedback_rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: Sample data removed - no need to insert placeholder documents
-- The tables are ready for actual document uploads through the application

-- Verify tables were created
SHOW TABLES LIKE '%hr_%';
SHOW TABLES LIKE '%chat_%';

-- Check table structures
DESCRIBE hr_documents;
DESCRIBE chat_conversations;
DESCRIBE chat_messages;

SELECT 'HR Chatbot Module Database Migration Completed Successfully!' AS Status;
