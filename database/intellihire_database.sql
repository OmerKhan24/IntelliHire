-- IntelliHire Database Schema
-- MySQL Database Setup for phpMyAdmin/XAMPP
-- Run this script in phpMyAdmin to create the complete database structure

-- Create Database
CREATE DATABASE IF NOT EXISTS intellihire_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE intellihire_db;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS responses;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS jobs;

-- =====================================================
-- JOBS TABLE
-- Stores interview job postings created by interviewers
-- =====================================================
CREATE TABLE jobs (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    duration_minutes INT DEFAULT 20,
    created_by VARCHAR(255) NOT NULL,
    scoring_criteria JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
    
    INDEX idx_created_by (created_by),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- INTERVIEWS TABLE
-- Stores interview sessions for each candidate
-- =====================================================
CREATE TABLE interviews (
    id VARCHAR(36) PRIMARY KEY,
    job_id VARCHAR(36) NOT NULL,
    candidate_name VARCHAR(255) NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    candidate_phone VARCHAR(20),
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    final_score DECIMAL(5,2),
    ai_analysis JSON,
    video_analysis JSON,
    speech_analysis JSON,
    warnings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_job_id (job_id),
    INDEX idx_candidate_email (candidate_email),
    INDEX idx_status (status),
    INDEX idx_completed_at (completed_at)
);

-- =====================================================
-- QUESTIONS TABLE
-- Stores AI-generated questions for each interview
-- =====================================================
CREATE TABLE questions (
    id VARCHAR(36) PRIMARY KEY,
    interview_id VARCHAR(36) NOT NULL,
    question TEXT NOT NULL,
    question_type ENUM('technical', 'behavioral', 'situational', 'general') DEFAULT 'general',
    difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    expected_duration INT DEFAULT 300, -- seconds
    order_index INT NOT NULL,
    ai_context JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    INDEX idx_interview_id (interview_id),
    INDEX idx_order_index (order_index),
    UNIQUE KEY unique_interview_order (interview_id, order_index)
);

-- =====================================================
-- RESPONSES TABLE
-- Stores candidate answers and AI analysis
-- =====================================================
CREATE TABLE responses (
    id VARCHAR(36) PRIMARY KEY,
    interview_id VARCHAR(36) NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    answer_text TEXT,
    answer_duration INT, -- seconds taken to answer
    confidence_score DECIMAL(5,2),
    relevance_score DECIMAL(5,2),
    technical_score DECIMAL(5,2),
    communication_score DECIMAL(5,2),
    ai_feedback TEXT,
    speech_analysis JSON,
    emotion_analysis JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_interview_id (interview_id),
    INDEX idx_question_id (question_id)
);

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- Insert some test data to verify the setup
-- =====================================================

-- Sample Job
INSERT INTO jobs (
    id, 
    title, 
    description, 
    requirements, 
    duration_minutes, 
    created_by,
    scoring_criteria
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Senior Software Engineer',
    'We are looking for an experienced software engineer to join our team. You will be working on full-stack development using modern technologies including React, Python, and cloud services.',
    'Bachelor\'s degree in Computer Science or related field, 3+ years of software development experience, proficiency in React and Python, experience with REST APIs and databases',
    30,
    'hr@techcorp.com',
    '{"technical_skills": {"weight": 0.4, "description": "Technical knowledge and problem-solving"}, "communication": {"weight": 0.3, "description": "Communication clarity and confidence"}, "behavioral": {"weight": 0.2, "description": "Team fit and professional behavior"}, "experience": {"weight": 0.1, "description": "Relevant experience and background"}}'
);

-- Sample Job 2
INSERT INTO jobs (
    id,
    title,
    description,
    requirements,
    duration_minutes,
    created_by,
    scoring_criteria
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'Frontend Developer',
    'Join our frontend team to build amazing user interfaces. Work with React, TypeScript, and modern CSS frameworks to create responsive web applications.',
    '2+ years frontend development, React expertise, TypeScript knowledge, CSS/SCSS proficiency, experience with responsive design',
    25,
    'hiring@webstudio.com',
    '{"technical_skills": {"weight": 0.5, "description": "Frontend technical expertise"}, "design_sense": {"weight": 0.2, "description": "UI/UX understanding"}, "communication": {"weight": 0.2, "description": "Communication and collaboration"}, "problem_solving": {"weight": 0.1, "description": "Problem-solving approach"}}'
);

-- Sample Interview
INSERT INTO interviews (
    id,
    job_id,
    candidate_name,
    candidate_email,
    candidate_phone,
    status,
    started_at,
    completed_at,
    final_score,
    ai_analysis
) VALUES (
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'John Doe',
    'john.doe@example.com',
    '+1-555-0123',
    'completed',
    '2025-11-08 10:00:00',
    '2025-11-08 10:28:00',
    78.5,
    '{"overall_assessment": "Strong technical candidate with good communication skills", "strengths": ["Solid React knowledge", "Clear communication", "Problem-solving approach"], "weaknesses": ["Limited cloud experience", "Could improve system design skills"], "recommendation": "Recommend for hire with mentoring on cloud technologies", "scores": {"technical_skills": 82, "communication": 75, "behavioral": 80, "experience": 70}}'
);

-- Sample Questions
INSERT INTO questions (
    id,
    interview_id,
    question,
    question_type,
    difficulty_level,
    expected_duration,
    order_index,
    ai_context
) VALUES 
(
    '770e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440001',
    'Tell me about your experience with React and how you handle state management in complex applications.',
    'technical',
    'medium',
    360,
    1,
    '{"category": "frontend_framework", "keywords": ["React", "state management", "Redux", "Context API"]}'
),
(
    '770e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440001',
    'Describe a challenging bug you encountered in your recent project and how you debugged it.',
    'technical',
    'medium',
    300,
    2,
    '{"category": "problem_solving", "keywords": ["debugging", "problem-solving", "troubleshooting"]}'
),
(
    '770e8400-e29b-41d4-a716-446655440003',
    '660e8400-e29b-41d4-a716-446655440001',
    'How do you handle working with team members who have different opinions on technical approaches?',
    'behavioral',
    'easy',
    240,
    3,
    '{"category": "teamwork", "keywords": ["collaboration", "conflict resolution", "communication"]}'
);

-- Sample Responses
INSERT INTO responses (
    id,
    interview_id,
    question_id,
    answer_text,
    answer_duration,
    confidence_score,
    relevance_score,
    technical_score,
    communication_score,
    ai_feedback
) VALUES 
(
    '880e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440001',
    '770e8400-e29b-41d4-a716-446655440001',
    'I have been working with React for over 3 years. For state management, I primarily use React Context API for smaller applications and Redux Toolkit for larger, more complex applications. In my recent project, I implemented a custom hook pattern for managing form state and used React Query for server state management. This separation of concerns helped keep the application maintainable and performant.',
    340,
    85.0,
    92.0,
    88.0,
    82.0,
    'Excellent answer demonstrating deep React knowledge. Candidate shows understanding of different state management approaches and when to use them. Good mention of modern patterns like React Query.'
),
(
    '880e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440001',
    '770e8400-e29b-41d4-a716-446655440002',
    'Recently, I encountered a memory leak in our React application. Users reported the app becoming slower over time. I used React DevTools Profiler to identify components that were not unmounting properly. The issue was event listeners not being cleaned up in useEffect hooks. I fixed it by properly returning cleanup functions in all useEffect hooks.',
    280,
    78.0,
    88.0,
    85.0,
    75.0,
    'Good technical debugging approach. Candidate demonstrates practical experience with performance issues and proper use of React DevTools. Shows understanding of component lifecycle management.'
),
(
    '880e8400-e29b-41d4-a716-446655440003',
    '660e8400-e29b-41d4-a716-446655440001',
    '770e8400-e29b-41d4-a716-446655440003',
    'When team members have different technical opinions, I try to facilitate open discussion where each person can present their approach with pros and cons. We evaluate based on factors like maintainability, performance, and team expertise. If needed, we create small prototypes to test different approaches. The goal is always to find the best solution for the project, not to win an argument.',
    220,
    82.0,
    90.0,
    70.0,
    88.0,
    'Excellent behavioral response showing maturity and collaboration skills. Demonstrates structured approach to conflict resolution and focus on project outcomes over personal preferences.'
);

-- =====================================================
-- CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for job statistics
CREATE VIEW job_statistics AS
SELECT 
    j.id as job_id,
    j.title,
    j.created_by,
    j.created_at,
    COUNT(i.id) as total_interviews,
    COUNT(CASE WHEN i.status = 'completed' THEN 1 END) as completed_interviews,
    COUNT(CASE WHEN i.status = 'in_progress' THEN 1 END) as in_progress_interviews,
    AVG(CASE WHEN i.status = 'completed' THEN i.final_score END) as average_score,
    MAX(i.final_score) as highest_score,
    MIN(i.final_score) as lowest_score
FROM jobs j
LEFT JOIN interviews i ON j.id = i.job_id
GROUP BY j.id, j.title, j.created_by, j.created_at;

-- View for interview details with candidate info
CREATE VIEW interview_details AS
SELECT 
    i.id as interview_id,
    i.job_id,
    j.title as job_title,
    i.candidate_name,
    i.candidate_email,
    i.status,
    i.started_at,
    i.completed_at,
    i.final_score,
    TIMESTAMPDIFF(MINUTE, i.started_at, i.completed_at) as duration_minutes,
    COUNT(q.id) as total_questions,
    COUNT(r.id) as answered_questions
FROM interviews i
JOIN jobs j ON i.job_id = j.id
LEFT JOIN questions q ON i.id = q.interview_id
LEFT JOIN responses r ON i.id = r.interview_id
GROUP BY i.id, j.title;

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional performance indexes
CREATE INDEX idx_jobs_title ON jobs(title);
CREATE INDEX idx_interviews_score ON interviews(final_score);
CREATE INDEX idx_responses_scores ON responses(confidence_score, relevance_score, technical_score, communication_score);

-- =====================================================
-- CREATE USER AND GRANT PERMISSIONS
-- (Optional - for production use)
-- =====================================================

-- Uncomment and modify these lines for production setup
-- CREATE USER 'intellihire_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON intellihire_db.* TO 'intellihire_user'@'localhost';
-- FLUSH PRIVILEGES;

-- =====================================================
-- VERIFICATION QUERIES
-- Test these queries after setup to verify everything works
-- =====================================================

-- Verify tables were created
SELECT TABLE_NAME, TABLE_ROWS 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'intellihire_db';

-- Check sample data
SELECT COUNT(*) as job_count FROM jobs;
SELECT COUNT(*) as interview_count FROM interviews;
SELECT COUNT(*) as question_count FROM questions;
SELECT COUNT(*) as response_count FROM responses;

-- Test the views
SELECT * FROM job_statistics;
SELECT * FROM interview_details;

-- Show foreign key relationships
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'intellihire_db'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- =====================================================
-- CLEANUP QUERIES (USE ONLY IF NEEDED)
-- =====================================================

-- Uncomment these lines if you need to completely reset the database
-- DROP VIEW IF EXISTS interview_details;
-- DROP VIEW IF EXISTS job_statistics;
-- DROP DATABASE IF EXISTS intellihire_db;

-- =====================================================
-- NOTES FOR XAMPP/phpMyAdmin SETUP
-- =====================================================

/*
INSTALLATION INSTRUCTIONS:

1. Start XAMPP and ensure MySQL is running
2. Open phpMyAdmin in your browser (usually http://localhost/phpmyadmin)
3. Click on "SQL" tab
4. Copy and paste this entire script
5. Click "Go" to execute

CONFIGURATION FOR YOUR FLASK APP:
Update your backend config with these database settings:

DATABASE_CONFIG = {
    'host': 'localhost',
    'user': 'root',  # Default XAMPP user
    'password': '',  # Default XAMPP password (empty)
    'database': 'intellihire_db',
    'port': 3306
}

MYSQL CONNECTION STRING:
mysql://root@localhost/intellihire_db

OR for SQLAlchemy:
mysql+pymysql://root@localhost/intellihire_db

TESTING:
After running this script, you should see:
- 4 main tables created (jobs, interviews, questions, responses)
- 2 sample jobs inserted
- 1 sample interview with questions and responses
- 2 views for common queries
- All necessary indexes for performance

The sample data allows you to immediately test your frontend without
creating jobs manually.
*/