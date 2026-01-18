-- Fix role column to support TEACHING_ASSISTANT
-- Run this SQL script in your MySQL database

USE lms;

-- Check current column definition first
SHOW COLUMNS FROM users LIKE 'role';

-- Alter column to support longer role names (TEACHING_ASSISTANT is 20 characters)
-- Change VARCHAR size to 50 to accommodate all role names
ALTER TABLE users 
MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'USER';

-- Verify the change
SHOW COLUMNS FROM users LIKE 'role';

-- Expected output should show: role | varchar(50) | NO | | USER | 
