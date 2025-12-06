-- Add status column to course table
ALTER TABLE course 
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING';

-- Update existing courses to APPROVED status
UPDATE course SET status = 'APPROVED' WHERE status IS NULL OR status = '';

-- Add index for better query performance
CREATE INDEX idx_course_status ON course(status);

