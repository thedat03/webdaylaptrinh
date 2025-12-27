# Tài liệu tích hợp Gemini API cho chấm bài tự động

## Tổng quan
Hệ thống đã được tích hợp với Google Gemini API để tự động chấm bài kiểm tra và cung cấp feedback chi tiết cho từng câu trả lời của học viên.

## Tính năng
- **Chấm bài tự động**: Sử dụng Gemini AI để đánh giá câu trả lời của học viên
- **Feedback chi tiết**: Cung cấp nhận xét, lời khuyên cụ thể cho từng câu hỏi
- **Hỗ trợ 2 loại câu hỏi**:
  - **Trắc nghiệm (MCQ)**: Đánh giá đáp án đã chọn
  - **Lập trình (CODE)**: Đánh giá code và kết quả test case

## Cấu hình

### 1. Thêm API Key vào `application.properties`
```properties
# Gemini API Configuration
gemini.api-key=${GEMINI_API_KEY:}
gemini.model=${GEMINI_MODEL:gemini-1.5-flash}
gemini.enabled=${GEMINI_ENABLED:true}
```

### 2. Lấy API Key từ Google AI Studio
1. Truy cập: https://aistudio.google.com/app/apikey
2. Tạo API key mới
3. Copy API key và thêm vào biến môi trường hoặc `application.properties`:
   ```properties
   gemini.api-key=YOUR_API_KEY_HERE
   ```

### 3. Cấu hình qua biến môi trường (khuyến nghị)
```bash
export GEMINI_API_KEY=your_api_key_here
```

## Cấu trúc Code

### Backend

#### 1. `GeminiService.java`
Service chính để gọi Gemini API:
- `gradeAndProvideFeedback()`: Phương thức chính để tạo feedback
- `buildPrompt()`: Xây dựng prompt cho Gemini
- `callGeminiAPI()`: Gọi REST API của Gemini
- `extractTextFromResponse()`: Trích xuất text từ response

#### 2. `ExamSubmissionService.java`
Đã được cập nhật để:
- Gọi `GeminiService` sau khi chấm điểm
- Lưu feedback vào `ExamSubmissionAnswer.feedback`
- Xử lý lỗi gracefully (không làm crash nếu Gemini API lỗi)

#### 3. `ExamSubmissionAnswer.java`
Entity đã được thêm field:
```java
@Column(length = 2000)
private String feedback; // Feedback từ Gemini AI cho học viên
```

### Frontend

#### `Assessment.jsx`
Đã được cập nhật để hiển thị feedback:
- Hiển thị feedback trong modal xem lại bài làm
- Format đẹp với gradient background
- Icon AI để dễ nhận biết

## Cách hoạt động

### 1. Khi học viên nộp bài
1. Hệ thống chấm điểm tự động (MCQ: so sánh đáp án, CODE: chạy test case)
2. Sau khi chấm điểm, gọi `GeminiService.gradeAndProvideFeedback()`
3. Gemini API tạo feedback dựa trên:
   - Nội dung câu hỏi
   - Đáp án đúng
   - Đáp án của học viên
   - Kết quả test case (nếu là câu hỏi code)
4. Feedback được lưu vào database
5. Học viên có thể xem feedback khi xem lại bài làm

### 2. Prompt được gửi đến Gemini
```
Bạn là một giáo viên chấm bài kiểm tra lập trình. Hãy đánh giá câu trả lời của học viên và đưa ra nhận xét, lời khuyên cụ thể.

Câu hỏi: [nội dung câu hỏi]
Loại câu hỏi: [Trắc nghiệm/Lập trình]
Đáp án đúng: [đáp án]
Đáp án học viên: [đáp án của học viên]
Kết quả: [ĐÚNG/SAI]

Hãy đưa ra:
1. Nhận xét về câu trả lời (ngắn gọn, 2-3 câu)
2. Điểm mạnh (nếu có)
3. Điểm cần cải thiện (nếu có)
4. Lời khuyên cụ thể để học viên cải thiện
5. Gợi ý học tập (nếu sai)
```

## Xử lý lỗi

- Nếu Gemini API không khả dụng hoặc lỗi, hệ thống sẽ:
  - Tạo feedback mặc định đơn giản
  - Không làm crash toàn bộ quá trình chấm bài
  - Log lỗi để debug

## Tối ưu hóa

### 1. Bật/tắt Gemini
Có thể tắt Gemini bằng cách:
```properties
gemini.enabled=false
```

### 2. Chọn model
Có thể chọn model khác:
```properties
gemini.model=gemini-1.5-pro  # Model mạnh hơn nhưng chậm hơn
gemini.model=gemini-1.5-flash # Model nhanh hơn (mặc định)
```

### 3. Tùy chỉnh prompt
Có thể chỉnh sửa prompt trong `GeminiService.buildPrompt()` để phù hợp với nhu cầu.

## Testing

### Test với API key thật
1. Thêm API key vào `application.properties`
2. Nộp một bài kiểm tra
3. Kiểm tra feedback trong database và frontend

### Test khi không có API key
1. Để trống `gemini.api-key`
2. Nộp bài kiểm tra
3. Hệ thống sẽ tạo feedback mặc định

## Lưu ý

1. **API Key bảo mật**: Không commit API key vào git. Sử dụng biến môi trường.
2. **Rate limiting**: Gemini API có giới hạn số request. Cân nhắc cache nếu cần.
3. **Chi phí**: Gemini API có thể tính phí theo số request. Kiểm tra pricing của Google.
4. **Độ trễ**: Gọi API có thể mất vài giây. Cân nhắc async processing nếu cần.

## Troubleshooting

### Gemini API không hoạt động
1. Kiểm tra API key có đúng không
2. Kiểm tra internet connection
3. Kiểm tra log để xem lỗi cụ thể
4. Kiểm tra `gemini.enabled=true`

### Feedback không hiển thị
1. Kiểm tra field `feedback` có được lưu trong database không
2. Kiểm tra frontend có đọc field `feedback` không
3. Kiểm tra console log để xem có lỗi không

## Tương lai

Có thể mở rộng:
- Cache feedback để giảm số lần gọi API
- Async processing để không block khi nộp bài
- Tùy chỉnh prompt theo từng loại câu hỏi
- Thêm feedback cho từng test case riêng lẻ
- Tích hợp với các AI model khác

