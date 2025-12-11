-- Tạo bảng notifications cho tính năng thông báo
CREATE TABLE IF NOT EXISTS notifications (
    notification_id BINARY(16) PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content VARCHAR(2000) NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    related_id BINARY(16),
    related_type VARCHAR(50),
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

