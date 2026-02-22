-- Ensure max_attempts exists and has a safe default to avoid insert errors
ALTER TABLE exams
    ADD COLUMN IF NOT EXISTS max_attempts INT NOT NULL DEFAULT 1;

ALTER TABLE exams
    MODIFY COLUMN max_attempts INT NOT NULL DEFAULT 1;

UPDATE exams
SET max_attempts = 1
WHERE max_attempts IS NULL;
