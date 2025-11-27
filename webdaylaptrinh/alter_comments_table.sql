-- Script to alter comments table to allow null for lesson_id and course_id
-- Run this SQL script in your MySQL database

USE lms;

-- Allow lesson_id to be null
ALTER TABLE comments 
MODIFY COLUMN lesson_id BINARY(16) NULL;

-- Allow course_id to be null (if column exists, otherwise it will be created by Hibernate)
ALTER TABLE comments 
MODIFY COLUMN course_id BINARY(16) NULL;

