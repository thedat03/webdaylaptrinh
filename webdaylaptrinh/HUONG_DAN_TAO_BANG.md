# Hướng dẫn tạo bảng code_exercises

## Vấn đề
Bảng `code_exercises` chưa tồn tại trong database, gây ra lỗi khi truy cập tính năng bài tập code.

## Giải pháp

### Cách 1: Chạy SQL Script thủ công (Khuyến nghị)

1. Mở MySQL client (MySQL Workbench, phpMyAdmin, hoặc command line)
2. Kết nối đến database `lms`
3. Chạy script sau:

```sql
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
```

4. Kiểm tra bảng đã được tạo:
```sql
SHOW TABLES LIKE 'code_exercises';
DESCRIBE code_exercises;
```

### Cách 2: Để Hibernate tự tạo (Nếu dùng ddl-auto=update)

1. Đảm bảo trong `application.properties` có:
   ```properties
   spring.jpa.hibernate.ddl-auto=update
   ```

2. Restart Spring Boot application
3. Hibernate sẽ tự động tạo bảng khi scan entity `CodeExercise`

### Cách 3: Chạy script từ command line

```bash
mysql -u root -p lms < CREATE_CODE_EXERCISES_TABLE.sql
```

## Sau khi tạo bảng

1. Restart Spring Boot application
2. Thử lại tính năng "Bài tập code"
3. Lỗi authentication sẽ tự biến mất sau khi bảng được tạo

## Lưu ý

- Đảm bảo database `lms` đã tồn tại
- Đảm bảo bảng `courses` đã tồn tại (vì có foreign key)
- Nếu gặp lỗi foreign key, kiểm tra xem bảng `courses` có cột `course_id` kiểu `BINARY(16)` không
