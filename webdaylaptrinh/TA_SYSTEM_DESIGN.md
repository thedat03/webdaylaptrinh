# Thiết kế Hệ thống Trợ giảng (TA)

## Tổng quan

Hệ thống bổ sung vai trò Trợ giảng (TA) để hỗ trợ học viên với 3 chức năng chính:
1. **Trả lời bình luận/câu hỏi** trong khóa học/bài học
2. **Hỏi trực tiếp** - học viên kết nối với TA bất kỳ
3. **Theo dõi tiến độ học** và gửi nhắc nhở

## 1. Database Schema

### 1.1. Bảng `ta_course_assignments`
Quản lý TA được phép truy cập khóa học nào.

**Các trường:**
- `id`: UUID
- `ta_id`: FK đến `users` (TA)
- `course_id`: FK đến `courses`
- `assigned_at`: Thời điểm phân công

**Ràng buộc:**
- Unique constraint: (ta_id, course_id) - mỗi TA chỉ được phân công một lần cho mỗi khóa học

### 1.2. Bảng `direct_questions`
Lưu trữ câu hỏi "Hỏi trực tiếp" của học viên.

**Các trường:**
- `id`: UUID
- `student_id`: FK đến `users` (học viên)
- `ta_id`: FK đến `users` (TA được phân công, nullable)
- `course_id`: FK đến `courses` (optional)
- `lesson_id`: FK đến `lessons` (optional)
- `content`: Nội dung câu hỏi
- `status`: PENDING | ASSIGNED | ANSWERED | CONVERTED
- `ta_response`: Phản hồi của TA
- `converted_to_comment`: Đã chuyển thành comment thường chưa
- `created_at`, `updated_at`, `responded_at`: Timestamps

**Luồng xử lý:**
1. Học viên tạo câu hỏi → status = PENDING
2. Hệ thống tự động phân công TA (nếu có) → status = ASSIGNED
3. TA trả lời → status = ANSWERED
4. Nếu không có TA online → chuyển thành comment thường → status = CONVERTED

### 1.3. Bảng `ta_reminders`
Lưu trữ nhắc nhở mà TA gửi cho học viên.

**Các trường:**
- `id`: UUID
- `ta_id`: FK đến `users` (TA)
- `student_id`: FK đến `users` (học viên)
- `course_id`: FK đến `courses` (optional)
- `lesson_id`: FK đến `lessons` (optional)
- `message`: Nội dung nhắc nhở
- `type`: GENERAL | INACTIVE | LESSON_NOT_COMPLETED | QUIZ_NOT_DONE | EXAM_NOT_DONE
- `status`: SENT | READ | ACTED
- `created_at`, `sent_at`: Timestamps

### 1.4. Cập nhật bảng `comments`
Thêm các trường để theo dõi trạng thái trả lời:

**Các trường mới:**
- `is_answered`: BOOLEAN - Đã được TA trả lời chưa
- `answered_by_ta_id`: FK đến `users` (TA đã trả lời)
- `answered_at`: Thời điểm TA trả lời

## 2. API Endpoints

### 2.1. Direct Questions (Hỏi trực tiếp)

#### Học viên tạo câu hỏi
```
POST /api/direct-questions
Body: {
  "content": "Câu hỏi của tôi",
  "courseId": "uuid" (optional),
  "lessonId": "uuid" (optional)
}
```

#### TA trả lời câu hỏi
```
POST /api/direct-questions/{questionId}/answer
Body: {
  "response": "Câu trả lời của TA"
}
```

#### TA tự nhận câu hỏi đang chờ
```
POST /api/direct-questions/{questionId}/claim
```

#### Lấy câu hỏi của học viên
```
GET /api/direct-questions/my-questions
```

#### Lấy câu hỏi được phân công cho TA
```
GET /api/direct-questions/ta/my-assigned
```

#### Lấy câu hỏi đang chờ (cho TA)
```
GET /api/direct-questions/pending
```

#### Chuyển câu hỏi thành comment
```
POST /api/direct-questions/{questionId}/convert-to-comment
```

### 2.2. TA Reminders (Nhắc nhở)

#### TA gửi nhắc nhở
```
POST /api/ta-reminders
Body: {
  "studentId": "uuid",
  "message": "Nội dung nhắc nhở",
  "type": "GENERAL" | "INACTIVE" | "LESSON_NOT_COMPLETED" | "QUIZ_NOT_DONE" | "EXAM_NOT_DONE",
  "courseId": "uuid" (optional),
  "lessonId": "uuid" (optional)
}
```

#### Lấy nhắc nhở của TA
```
GET /api/ta-reminders/ta/my-reminders
```

#### Lấy nhắc nhở của học viên
```
GET /api/ta-reminders/my-reminders
```

#### Đánh dấu đã đọc
```
PUT /api/ta-reminders/{reminderId}/read
```

### 2.3. TA Progress (Theo dõi tiến độ)

#### Lấy tiến độ tất cả học viên trong khóa học
```
GET /api/ta-progress/course/{courseId}/students
```

#### Lấy tiến độ một học viên cụ thể
```
GET /api/ta-progress/course/{courseId}/student/{studentId}
```

#### Lấy học viên cần nhắc nhở
```
GET /api/ta-progress/course/{courseId}/students-needing-reminder?daysInactive=7
```

### 2.4. Comments (Cập nhật cho TA)

#### TA xem comment chưa trả lời
```
GET /api/comments/unanswered
```

#### TA xem comment trong bài học
```
GET /api/comments/lesson/{lessonId}/ta
```

#### TA xem comment trong khóa học
```
GET /api/comments/course/{courseId}/ta
```

#### TA trả lời comment
```
POST /api/comments/{commentId}/ta-answer
Body: {
  "content": "Câu trả lời của TA"
}
```

## 3. Luồng xử lý

### 3.1. Trả lời bình luận/câu hỏi

1. **Học viên đặt câu hỏi** trong khóa học/bài học → tạo Comment
2. **TA xem danh sách comment chưa trả lời** → GET /api/comments/unanswered
3. **TA trả lời** → POST /api/comments/{commentId}/ta-answer
   - Tạo reply comment
   - Đánh dấu comment gốc: `isAnswered = true`, `answeredByTa = TA`, `answeredAt = now()`

### 3.2. Hỏi trực tiếp

1. **Học viên tạo câu hỏi "Hỏi trực tiếp"** → POST /api/direct-questions
   - Tạo DirectQuestion với status = PENDING
2. **Hệ thống tự động phân công TA** (nếu có TA online):
   - Lấy danh sách TA có quyền truy cập khóa học (nếu có courseId)
   - Chọn TA ngẫu nhiên từ danh sách
   - Cập nhật: `ta_id = selectedTA`, `status = ASSIGNED`
3. **Nếu không có TA online**:
   - Giữ status = PENDING
   - Học viên có thể chuyển thành comment thường → POST /api/direct-questions/{questionId}/convert-to-comment
4. **TA trả lời** → POST /api/direct-questions/{questionId}/answer
   - Cập nhật: `taResponse = response`, `status = ANSWERED`, `respondedAt = now()`
5. **TA tự nhận câu hỏi** (nếu chưa được phân công):
   - POST /api/direct-questions/{questionId}/claim
   - Kiểm tra quyền truy cập khóa học
   - Cập nhật: `ta_id = TA`, `status = ASSIGNED`

### 3.3. Theo dõi tiến độ và nhắc nhở

1. **TA xem tiến độ học viên**:
   - GET /api/ta-progress/course/{courseId}/students
   - Trả về: % hoàn thành, bài đã học/chưa học, lần hoạt động gần nhất
2. **TA xem học viên cần nhắc nhở**:
   - GET /api/ta-progress/course/{courseId}/students-needing-reminder?daysInactive=7
   - Lọc học viên không hoạt động trong X ngày
3. **TA gửi nhắc nhở**:
   - POST /api/ta-reminders
   - Tạo TAReminder với type phù hợp (INACTIVE, LESSON_NOT_COMPLETED, etc.)

## 4. Nguyên tắc chọn TA

### 4.1. Tự động phân công (Auto-assign)
- **Khi có courseId**: Chọn từ danh sách TA có quyền truy cập khóa học đó
- **Khi không có courseId**: Chọn từ tất cả TA đang active
- **Cơ chế**: Chọn ngẫu nhiên (có thể cải thiện: chọn TA có ít câu hỏi đang xử lý nhất)

### 4.2. Fallback khi không có TA online
- Giữ status = PENDING
- Học viên có thể:
  - Chờ TA online
  - Chuyển thành comment thường để cộng đồng trả lời
  - TA có thể tự nhận câu hỏi sau

### 4.3. Thông báo
- **In-app notification**: Tạo Notification khi có câu hỏi mới cho TA
- **Email/Push**: Có thể implement sau nếu cần

## 5. Tracking tiến độ học

### 5.1. Events cần ghi nhận
- **Lesson access**: Khi học viên mở bài học → `lastAccessedAt` trong `LessonProgress`
- **Lesson completion**: Khi học viên hoàn thành bài học → `isCompleted = true`, `completedAt` trong `LessonProgress`
- **Quiz/Exam submission**: Từ `ExamSubmission` entity (đã có sẵn)

### 5.2. Dashboard tối thiểu cho TA
- **Danh sách học viên** trong khóa học
- **Tiến độ từng học viên**:
  - % hoàn thành khóa học
  - Số bài đã học / Tổng số bài
  - Lần hoạt động gần nhất
  - Trạng thái từng bài học (đã học/chưa học)
- **Học viên cần nhắc nhở**:
  - Không hoạt động trong X ngày
  - Chưa hoàn thành bài học cụ thể
  - Chưa làm quiz/đề thi

## 6. Phân quyền

### 6.1. TA Course Assignment
- **Admin/Instructor** phân công TA cho khóa học
- **TA** chỉ xem được comment/tiến độ trong khóa học được phân công

### 6.2. Permissions
- **TEACHING_ASSISTANT** role có thể:
  - Xem và trả lời comment trong khóa học được phân công
  - Xem tiến độ học viên trong khóa học được phân công
  - Gửi nhắc nhở cho học viên
  - Trả lời câu hỏi "Hỏi trực tiếp"
- **STUDENT/USER** có thể:
  - Tạo câu hỏi "Hỏi trực tiếp"
  - Xem nhắc nhở của mình

## 7. Cài đặt

### 7.1. Chạy SQL script
```sql
-- Chạy file CREATE_TA_TABLES.sql
```

### 7.2. Phân công TA cho khóa học
```sql
-- Ví dụ: Phân công TA (user_id) cho khóa học (course_id)
INSERT INTO ta_course_assignments (id, ta_id, course_id, assigned_at)
VALUES (UUID(), 'ta_user_id', 'course_id', NOW());
```

### 7.3. Set role cho user thành TA
```sql
-- Cập nhật role của user thành TEACHING_ASSISTANT
UPDATE users SET role = 'TEACHING_ASSISTANT' WHERE id = 'user_id';
```

## 8. Cải tiến tương lai

1. **Cải thiện thuật toán chọn TA**:
   - Chọn TA có ít câu hỏi đang xử lý nhất
   - Chọn TA có thời gian phản hồi nhanh nhất
   - Load balancing

2. **Thông báo real-time**:
   - WebSocket cho thông báo tức thời
   - Push notification

3. **Auto-reminder rules**:
   - Tự động tạo nhắc nhở dựa trên rule (7 ngày không học, chưa hoàn thành bài X)
   - Scheduled job để chạy auto-reminder

4. **Analytics**:
   - Thống kê số câu hỏi TA đã trả lời
   - Thời gian phản hồi trung bình
   - Đánh giá từ học viên
