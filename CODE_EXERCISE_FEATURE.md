# Tính năng Bài tập Code (Code Exercise Feature)

## Tổng quan

Tính năng Bài tập Code cho phép giảng viên tạo các bài tập code riêng biệt trong khóa học, tách biệt khỏi cấu trúc bài học (Lesson). Mỗi bài tập code có thể có:
- Tiêu đề và mô tả
- Tài liệu hướng dẫn (Markdown format)
- Code template ban đầu
- Test cases (bao gồm hidden test cases)
- Tích hợp với Judge0 để chạy và kiểm tra code

## Cấu trúc Backend

### Entity: CodeExercise
- `exercise_id` (UUID): ID duy nhất của bài tập
- `course_id` (UUID): ID khóa học chứa bài tập
- `title` (String): Tiêu đề bài tập
- `description` (String): Mô tả/yêu cầu bài tập
- `documentation` (String): Tài liệu hướng dẫn chi tiết (Markdown)
- `codeSnippet` (String): Code template ban đầu
- `codeLanguageId` (Integer): Judge0 language ID
- `codeTestCases` (String): JSON array chứa test cases
- `position` (Integer): Vị trí sắp xếp
- `estimatedMinutes` (Integer): Thời gian ước tính hoàn thành

### Repository: CodeExerciseRepository
- `findByCourseIdOrderByPosition`: Lấy tất cả bài tập của một khóa học
- `countByCourseId`: Đếm số bài tập trong khóa học

### Service: CodeExerciseService
- `createCodeExercise`: Tạo bài tập mới
- `updateCodeExercise`: Cập nhật bài tập
- `getCodeExerciseById`: Lấy bài tập theo ID
- `getCodeExercisesByCourseId`: Lấy danh sách bài tập của khóa học
- `deleteCodeExercise`: Xóa bài tập

### Controller: CodeExerciseController
- `POST /api/code-exercises`: Tạo bài tập mới
- `PUT /api/code-exercises/{exerciseId}`: Cập nhật bài tập
- `GET /api/code-exercises/{exerciseId}`: Lấy bài tập theo ID
- `GET /api/code-exercises/course/{courseId}`: Lấy danh sách bài tập của khóa học
- `DELETE /api/code-exercises/{exerciseId}`: Xóa bài tập

### Code Execution
- `POST /api/code/exercises/{exerciseId}/run`: Chạy code và kiểm tra test cases

## Cấu trúc Frontend

### Service: codeExercise.service.js
Cung cấp các phương thức:
- `getCodeExercisesByCourseId(courseId)`
- `getCodeExerciseById(exerciseId)`
- `createCodeExercise(exerciseData)`
- `updateCodeExercise(exerciseId, exerciseData)`
- `deleteCodeExercise(exerciseId)`
- `runCodeExercise(exerciseId, payload)`

### Component: CodeExerciseModal
Modal để giảng viên tạo/sửa bài tập code:
- Form nhập tiêu đề, mô tả
- Editor Markdown cho tài liệu hướng dẫn
- Chọn ngôn ngữ Judge0
- Quản lý test cases (thêm, sửa, xóa)
- Upload ảnh minh họa

### Component: CodeExerciseViewer
Component để học sinh xem và làm bài tập:
- Hiển thị yêu cầu và tài liệu hướng dẫn
- Code editor với syntax highlighting
- Test cases panel
- Nút chạy code và kiểm tra kết quả
- Hiển thị kết quả từng test case

### Tích hợp vào Dashboard
- Thêm section "Bài tập code" trong DCourses.jsx
- Nút "Bài tập code" trong danh sách khóa học
- Quản lý CRUD bài tập code trong từng khóa học

## Route

- `/code-exercise/:exerciseId`: Trang xem và làm bài tập code

## Bảo mật

- GET: Tất cả user đã đăng nhập (USER, STUDENT, ADMIN, INSTRUCTOR, TEACHING_ASSISTANT)
- POST/PUT/DELETE: Chỉ INSTRUCTOR
- Code execution: Tất cả user đã đăng nhập

## Database Migration

File migration: `src/main/resources/db/migration/create_code_exercises_table.sql`

## Sử dụng

### Giảng viên tạo bài tập code:
1. Vào trang quản lý khóa học (DCourses)
2. Click "Bài tập code" trên khóa học
3. Click "Thêm bài tập code"
4. Điền thông tin và test cases
5. Lưu

### Học sinh làm bài tập:
1. Truy cập `/code-exercise/{exerciseId}`
2. Đọc yêu cầu và tài liệu
3. Viết code trong editor
4. Click "KIỂM TRA" để chạy test cases
5. Xem kết quả và sửa code nếu cần

## Khác biệt với Lesson type CODE

- **CodeExercise**: Bài tập riêng, không nằm trong cấu trúc module/lesson
- **Lesson CODE**: Bài học code nằm trong giáo trình, có thể có video/material kèm theo
- CodeExercise tập trung vào thực hành code thuần túy với tài liệu hướng dẫn chi tiết
