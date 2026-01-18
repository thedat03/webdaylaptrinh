-- Thêm các field mới vào lesson_progress để track video progress
ALTER TABLE lesson_progress 
ADD COLUMN watched_seconds INT DEFAULT 0,
ADD COLUMN watched_percentage DOUBLE DEFAULT 0.0;

-- Thêm field enrolled_at vào learning để biết ngày đăng ký
ALTER TABLE learning 
ADD COLUMN enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Cập nhật enrolled_at cho các record cũ (nếu có)
UPDATE learning 
SET enrolled_at = CURRENT_TIMESTAMP 
WHERE enrolled_at IS NULL;

-- Thêm field planned_days vào course (có thể null, sẽ tính tự động)
ALTER TABLE course 
ADD COLUMN planned_days INT NULL;

-- Tạo index để tối ưu query
CREATE INDEX idx_lesson_progress_watched ON lesson_progress(watched_percentage);
CREATE INDEX idx_learning_enrolled_at ON learning(enrolled_at);
