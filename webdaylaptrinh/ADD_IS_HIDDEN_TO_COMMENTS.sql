-- Add is_hidden column to comments table for TA comment management
ALTER TABLE comments 
ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT FALSE;

-- Add index for better query performance
CREATE INDEX idx_comments_is_hidden ON comments(is_hidden);
