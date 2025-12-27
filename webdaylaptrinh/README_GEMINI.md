# Hướng dẫn sử dụng Gemini API cho chấm bài tự động

## Bước 1: Lấy API Key
1. Truy cập: https://aistudio.google.com/app/apikey
2. Đăng nhập bằng tài khoản Google
3. Click "Create API Key"
4. Copy API key

## Bước 2: Cấu hình
Thêm vào file `application.properties`:
```properties
gemini.api-key=YOUR_API_KEY_HERE
```

Hoặc sử dụng biến môi trường:
```bash
export GEMINI_API_KEY=your_api_key_here
```

## Bước 3: Test
1. Khởi động ứng dụng
2. Đăng nhập và làm bài kiểm tra
3. Nộp bài
4. Xem feedback trong phần "Xem lại bài làm"

## Lưu ý
- Nếu không có API key, hệ thống vẫn hoạt động bình thường nhưng chỉ có feedback mặc định
- API key nên được bảo mật, không commit vào git
- Xem file `GEMINI_INTEGRATION.md` để biết chi tiết kỹ thuật

