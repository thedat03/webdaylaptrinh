-- Script để tạo các bảng cho chức năng Trợ giảng (TA)
-- Chạy script này trong MySQL database

USE lms;

-- 1. Bảng quản lý TA được phép truy cập khóa học nào
CREATE TABLE IF NOT EXISTS ta_course_assignments (
    id BINARY(16) PRIMARY KEY,
    ta_id BINARY(16) NOT NULL,
    course_id BINARY(16) NOT NULL,
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ta_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    UNIQUE KEY unique_ta_course (ta_id, course_id),
    INDEX idx_ta_id (ta_id),
    INDEX idx_course_id (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng "Hỏi trực tiếp" - học viên kết nối với TA
CREATE TABLE IF NOT EXISTS direct_questions (
    id BINARY(16) PRIMARY KEY,
    student_id BINARY(16) NOT NULL,
    ta_id BINARY(16) NULL,
    course_id BINARY(16) NULL,
    lesson_id BINARY(16) NULL,
    content VARCHAR(2000) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    ta_response VARCHAR(2000) NULL,
    converted_to_comment BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    responded_at DATETIME NULL,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ta_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_ta_id (ta_id),
    INDEX idx_course_id (course_id),
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng nhắc nhở của TA
CREATE TABLE IF NOT EXISTS ta_reminders (
    id BINARY(16) PRIMARY KEY,
    ta_id BINARY(16) NOT NULL,
    student_id BINARY(16) NOT NULL,
    course_id BINARY(16) NULL,
    lesson_id BINARY(16) NULL,
    message VARCHAR(1000) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    status VARCHAR(20) NOT NULL DEFAULT 'SENT',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ta_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    INDEX idx_ta_id (ta_id),
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_type (type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Cập nhật bảng comments để thêm trạng thái answered
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS is_answered BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS answered_by_ta_id BINARY(16) NULL,
ADD COLUMN IF NOT EXISTS answered_at DATETIME NULL,
ADD FOREIGN KEY (answered_by_ta_id) REFERENCES users(id) ON DELETE SET NULL,
ADD INDEX idx_is_answered (is_answered),
ADD INDEX idx_answered_by_ta (answered_by_ta_id);
