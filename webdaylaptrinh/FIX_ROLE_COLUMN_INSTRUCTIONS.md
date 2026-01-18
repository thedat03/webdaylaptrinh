# Hướng dẫn sửa lỗi "Data truncated for column 'role'"

## Vấn đề
Khi tạo user với role `TEACHING_ASSISTANT`, database báo lỗi "Data truncated for column 'role'" vì cột `role` quá nhỏ.

## Giải pháp

### Bước 1: Chạy SQL script để sửa cột role

Mở MySQL client (MySQL Workbench, phpMyAdmin, hoặc command line) và chạy:

```sql
USE lms;

-- Kiểm tra kích thước hiện tại
SHOW COLUMNS FROM users LIKE 'role';

-- Sửa cột role để hỗ trợ tên role dài hơn
ALTER TABLE users 
MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'USER';

-- Xác nhận đã sửa
SHOW COLUMNS FROM users LIKE 'role';
```

### Bước 2: Restart backend application

Sau khi chạy SQL script, restart Spring Boot application.

### Bước 3: Thử lại tạo user với role TA

Vào `/admin` → Quản lý người dùng → Tạo người dùng mới với role "TEACHING_ASSISTANT"

## Lưu ý

- Nếu vẫn gặp lỗi, kiểm tra xem cột `role` đã được sửa thành `VARCHAR(50)` chưa
- Có thể cần xóa và tạo lại bảng nếu có dữ liệu quan trọng (backup trước!)
- Entity User đã được cập nhật với `@Column(length = 50)` để đảm bảo Hibernate tạo cột đúng kích thước
