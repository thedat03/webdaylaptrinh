-- Add rating and resolved fields to direct_questions table
ALTER TABLE direct_questions
ADD COLUMN rating INT NULL,
ADD COLUMN is_resolved BOOLEAN DEFAULT FALSE,
ADD COLUMN resolved_at DATETIME NULL;

-- Add index for better query performance
CREATE INDEX idx_direct_questions_resolved ON direct_questions(is_resolved);
CREATE INDEX idx_direct_questions_rating ON direct_questions(rating);
