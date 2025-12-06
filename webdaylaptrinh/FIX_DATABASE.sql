-- FIX DATABASE: Add Judge0 fields to lesson table
-- Copy and paste this into your MySQL client and run it

USE lms;

-- Add code_language_id column
ALTER TABLE lesson 
ADD COLUMN code_language_id INT NULL;

-- Add code_test_cases column
ALTER TABLE lesson 
ADD COLUMN code_test_cases TEXT NULL;

-- Verify columns were added
DESCRIBE lesson;

