-- Add cv_file_path column to interviews table for storing uploaded CV files
-- Run this in phpMyAdmin or MySQL command line

ALTER TABLE interviews ADD COLUMN IF NOT EXISTS cv_file_path VARCHAR(500) AFTER candidate_phone;
