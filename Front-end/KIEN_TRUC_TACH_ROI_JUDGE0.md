# Kiến trúc Tách Rời (Decoupled Architecture) - Tích hợp Judge0 API

## Tổng quan

Hệ thống sử dụng kiến trúc tách rời với Judge0 API như dịch vụ chấm ngoài. Backend tập trung xử lý nghiệp vụ, Judge0 xử lý biên dịch, thực thi và chấm test case.

## Sơ đồ Kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (React)                           │
│  ┌──────────────┐         ┌──────────────┐            │
│  │ LessonViewer │         │CodeExerciseView│           │
│  └──────┬───────┘         └──────┬───────┘            │
│         │                        │                     │
│  ┌──────▼───────┐         ┌──────▼───────┐            │
│  │ code.service │         │codeExercise. │            │
│  └──────┬───────┘         │  service     │            │
│         └────────┬────────┘              │            │
│                  │ POST /api/code/.../run│            │
└──────────────────┼────────────────────────┘            │
                   │                                      │
                   ▼                                      │
┌─────────────────────────────────────────────────────────┐
│         BACKEND (Spring Boot)                           │
│  ┌──────────────────────────────────────┐             │
│  │  CodeExecutionController              │             │
│  │  /api/code/lessons/{id}/run           │             │
│  │  /api/code/exercises/{id}/run         │             │
│  └───────────────┬──────────────────────┘             │
│                  │                                     │
│  ┌───────────────▼──────────────────────┐             │
│  │  CodeExecutionService                 │             │
│  │  1. Validate & Load test cases        │             │
│  │  2. For each test: Call Judge0        │             │
│  │  3. Aggregate results                 │             │
│  └───────────────┬──────────────────────┘             │
│                  │                                     │
│                  │ Load Test Cases                     │
│                  ▼                                     │
│  ┌──────────────────────────────────────┐             │
│  │  DATABASE (MySQL)                     │             │
│  │  Lesson/CodeExercise:                 │             │
│  │  - codeLanguageId                     │             │
│  │  - codeTestCases (JSON)               │             │
│  └──────────────────────────────────────┘             │
│                  │                                     │
│                  │ POST /submissions?wait=true        │
└──────────────────┼─────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│         JUDGE0 API (External Service)                    │
│  POST /submissions?wait=true                             │
│  { language_id, source_code, stdin, expected_output }    │
│  → { status, stdout, stderr, time, memory }             │
│                                                          │
│  • Sandbox execution                                     │
│  • Multi-language support                                │
│  • Synchronous wait mode                                 │
└─────────────────────────────────────────────────────────┘
```

## Luồng Xử lý

```
User → Frontend → Backend Controller → CodeExecutionService
                                              │
                                              ├─→ Load test cases (DB)
                                              │
                                              └─→ For each test case:
                                                  POST Judge0 API (wait=true)
                                                  ← Response (status, stdout, stderr)
                                              │
                                              └─→ Aggregate results
                                              │
Backend ← CodeExecutionService ←────────────────┘
    │
    └─→ Frontend → Display Results
```

**Cơ chế đồng bộ (wait mode)**: Backend gửi request và chờ Judge0 xử lý xong, nhận kết quả ngay trong cùng một request-response cycle.

## Ưu điểm

- **Bảo mật**: Code chạy trong sandbox của Judge0, tách biệt khỏi server chính
- **Đa ngôn ngữ**: Hỗ trợ C/C++, Java, Python, JavaScript... không cần cài đặt compiler/runtime
- **Hiệu năng**: Giảm tải backend, Judge0 tối ưu cho chấm code
- **Đơn giản**: Không cần quản lý Docker, compilers; cấu hình qua environment variables
