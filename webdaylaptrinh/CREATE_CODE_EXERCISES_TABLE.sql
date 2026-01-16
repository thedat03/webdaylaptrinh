-- Script để tạo bảng code_exercises
-- Chạy script này trong MySQL để tạo bảng

USE lms;

CREATE TABLE IF NOT EXISTS code_exercises (
    exercise_id BINARY(16) PRIMARY KEY,
    course_id BINARY(16) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    documentation TEXT,
    code_snippet TEXT,
    code_language_id INT,
    code_test_cases TEXT,
    position_index INT DEFAULT 0,
    estimated_minutes INT,
    FOREIGN KEY (course_id) REFERENCES course(course_id) ON DELETE CASCADE,
    INDEX idx_course_id (course_id),
    INDEX idx_position (position_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
