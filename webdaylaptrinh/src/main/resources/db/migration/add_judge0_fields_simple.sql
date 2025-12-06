-- Simple SQL script to add Judge0 fields to lesson table
-- Run this directly in MySQL

-- Check and add code_language_id if not exists
ALTER TABLE lesson 
ADD COLUMN IF NOT EXISTS code_language_id INT NULL;

-- Check and add code_test_cases if not exists  
ALTER TABLE lesson 
ADD COLUMN IF NOT EXISTS code_test_cases TEXT NULL;

