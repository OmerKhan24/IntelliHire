-- Add voice_analysis_data column to responses table for storing voice metrics
-- Run this in phpMyAdmin or MySQL command line

ALTER TABLE responses ADD COLUMN IF NOT EXISTS voice_analysis_data JSON AFTER answer_duration;
