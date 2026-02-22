-- Alter feedback column to TEXT to support longer AI feedback
ALTER TABLE exam_submission_answers 
MODIFY COLUMN feedback TEXT;
