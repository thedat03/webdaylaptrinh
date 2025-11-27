-- Auto-run SQL script to update comments table schema
-- This allows lesson_id and course_id to be null

ALTER TABLE comments 
MODIFY COLUMN lesson_id BINARY(16) NULL;

-- Add course_id column if it doesn't exist (Hibernate will create it, but this ensures it's nullable)
-- Note: If course_id column doesn't exist yet, Hibernate will create it with nullable=true based on entity definition

