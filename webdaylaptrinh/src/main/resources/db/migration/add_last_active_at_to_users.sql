-- Thêm field last_active_at vào bảng users để track online status
ALTER TABLE users 
ADD COLUMN last_active_at DATETIME NULL;

-- Cập nhật last_active_at cho các user hiện có (set bằng updated_at hoặc created_at)
UPDATE users 
SET last_active_at = COALESCE(updated_at, created_at, NOW())
WHERE last_active_at IS NULL;

-- Tạo index để tối ưu query online status
CREATE INDEX idx_users_last_active_at ON users(last_active_at);
