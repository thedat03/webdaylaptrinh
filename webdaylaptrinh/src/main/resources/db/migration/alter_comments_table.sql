-- Alter comments table to allow null for lesson_id and course_id
-- This allows comments to be associated with either a lesson or a course

ALTER TABLE comments 
MODIFY COLUMN lesson_id BINARY(16) NULL;

ALTER TABLE comments 
MODIFY COLUMN course_id BINARY(16) NULL;

-- Add constraint to ensure at least one of lesson_id or course_id is not null
-- Note: This constraint will be enforced at application level
-- MySQL doesn't support CHECK constraints in older versions, so we'll handle it in code

