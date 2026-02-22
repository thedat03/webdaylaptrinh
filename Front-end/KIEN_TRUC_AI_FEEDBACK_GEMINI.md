# Kiến trúc Trợ lý ảo hỗ trợ làm bài thi - Tích hợp Google Gemini AI

## Tổng quan

Hệ thống tích hợp Google Gemini Pro để tạo phản hồi AI sau khi nộp bài thi. Tính năng chỉ áp dụng trong mô-đun thi, cung cấp feedback mang tính sư phạm cho cả câu trắc nghiệm và câu lập trình.

## Sơ đồ Kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (React)                           │
│  ┌──────────────────────────────────────┐             │
│  │  Assessment.jsx (Exam Page)           │             │
│  │  - User làm bài thi                   │             │
│  │  - Submit bài thi                     │             │
│  └───────────────┬──────────────────────┘             │
│                  │                                      │
│  ┌───────────────▼──────────────────────┐             │
│  │  examService.submitExam()              │             │
│  └───────────────┬──────────────────────┘             │
│                  │ POST /api/exams/{id}/submit         │
└──────────────────┼─────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│         BACKEND (Spring Boot)                           │
│  ┌──────────────────────────────────────┐             │
│  │  ExamController                       │             │
│  │  POST /api/exams/{examId}/submit      │             │
│  └───────────────┬──────────────────────┘             │
│                  │                                     │
│  ┌───────────────▼──────────────────────┐             │
│  │  ExamSubmissionService                │             │
│  │                                        │             │
│  │  1. Lưu submission                    │             │
│  │  2. Chấm từng câu hỏi:                │             │
│  │     - MCQ: So sánh đáp án             │             │
│  │     - CODE: Chạy test cases (Judge0)  │             │
│  │  3. Gọi Gemini cho mỗi câu:           │             │
│  │     → Tạo feedback                    │             │
│  │  4. Lưu feedback vào DB               │             │
│  └───────────────┬──────────────────────┘             │
│                  │                                     │
│                  │ For each question                   │
│                  ▼                                     │
│  ┌──────────────────────────────────────┐             │
│  │  GeminiService                        │             │
│  │  - Build prompt (context)            │             │
│  │  - Call Gemini API                   │             │
│  │  - Parse response                    │             │
│  └───────────────┬──────────────────────┘             │
│                  │                                     │
│                  │ POST Gemini API                     │
└──────────────────┼─────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│    GOOGLE GEMINI API (External Service)                  │
│  POST /v1beta/models/{model}:generateContent            │
│                                                          │
│  Request:                                                │
│  {                                                       │
│    "contents": [{                                       │
│      "parts": [{ "text": "prompt..." }]                 │
│    }],                                                   │
│    "generationConfig": {                                │
│      "temperature": 0.7,                                │
│      "maxOutputTokens": 8192                            │
│    }                                                     │
│  }                                                       │
│                                                          │
│  Response:                                               │
│  {                                                       │
│    "candidates": [{                                      │
│      "content": {                                       │
│        "parts": [{ "text": "feedback..." }]            │
│      }                                                   │
│    }]                                                    │
│  }                                                       │
│                                                          │
│  • Generative AI model                                   │
│  • Educational feedback                                  │
│  • Vietnamese language support                           │
└─────────────────────────────────────────────────────────┘
                   │
                   │ Feedback text
                   ▼
┌─────────────────────────────────────────────────────────┐
│         DATABASE (MySQL)                                 │
│  ExamSubmissionAnswer:                                   │
│  - question_id                                           │
│  - selected_option / code_answer                         │
│  - passed                                                │
│  - score                                                 │
│  - feedback (TEXT) ← Lưu feedback từ Gemini            │
│  - auto_result (test case results)                       │
└─────────────────────────────────────────────────────────┘
                   │
                   │ Load submission with feedback
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Frontend: Display Results                               │
│  - Hiển thị điểm số                                      │
│  - Hiển thị feedback từ AI cho từng câu                 │
│  - Polling để check feedback ready (nếu cần)            │
└─────────────────────────────────────────────────────────┘
```

## Luồng Xử lý

```
User Submit Exam
    │
    ▼
Backend: ExamSubmissionService.submit()
    │
    ├─→ For each question:
    │   │
    │   ├─→ MCQ: Compare answer → isCorrect
    │   │
    │   └─→ CODE: Execute test cases (Judge0) → results
    │
    ├─→ For each question:
    │   │
    │   └─→ GeminiService.gradeAndProvideFeedback()
    │       │
    │       ├─→ Build prompt (question, answer, result)
    │       │
    │       ├─→ POST Gemini API
    │       │
    │       └─→ Parse response → feedback text
    │
    ├─→ Save submission + feedback to DB
    │
    └─→ Return submission to Frontend
        │
        └─→ Frontend displays feedback
```

## Prompt Structure

**Cho câu trắc nghiệm (MCQ):**
- Nội dung câu hỏi
- Đáp án đúng
- Đáp án học viên chọn
- Kết quả (ĐÚNG/SAI)

**Cho câu lập trình (CODE):**
- Nội dung câu hỏi
- Code mẫu (tham khảo)
- Code của học viên
- Kết quả test case (từ Judge0)
- Kết quả (ĐÚNG/SAI)

**Yêu cầu output:**
1. Nhận xét về câu trả lời (2-3 câu)
2. Điểm mạnh (nếu có)
3. Điểm cần cải thiện (nếu có)
4. Lời khuyên cụ thể
5. Gợi ý học tập (nếu sai)

## Ưu điểm

- **Tích hợp mượt mà**: Chỉ áp dụng trong mô-đun thi, không ảnh hưởng các chức năng khác
- **Phản hồi sư phạm**: Feedback mang tính hướng dẫn, giúp học viên tự đánh giá và cải thiện
- **Xử lý lỗi graceful**: Nếu Gemini lỗi, vẫn lưu submission và trả về feedback mặc định
- **Độc lập**: GeminiService là dịch vụ backend riêng, dễ mở rộng hoặc điều chỉnh
