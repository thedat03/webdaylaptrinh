# 4.4 Kiểm thử hệ thống

Kiểm thử là một bước quan trọng trong quá trình phát triển phần mềm nhằm đảm bảo các quy trình nghiệp vụ hoạt động đúng như mong đợi và dữ liệu được lưu trữ chính xác. Để đảm bảo chất lượng hệ thống, sinh viên đã sử dụng kỹ thuật kiểm thử hộp đen (Black-box Testing) để kiểm thử các chức năng chính của hệ thống.

Kiểm thử hộp đen được sử dụng để kiểm thử chức năng mà không cần biết chi tiết cấu trúc bên trong của hệ thống. Sinh viên tập trung kiểm thử đầu vào và đầu ra của các chức năng, đảm bảo hệ thống hoạt động đúng trong các tình huống sử dụng thực tế.

Sinh viên đã thiết kế và thực hiện kiểm thử cho ba chức năng quan trọng nhất của hệ thống:

1. **Quản lý khóa học** – Chức năng tạo, chỉnh sửa, hiển thị và quản lý nội dung khóa học
2. **Thực thi mã nguồn** – Chức năng thực thi và đánh giá mã nguồn thông qua tích hợp Judge0 API
3. **Thanh toán khóa học** – Chức năng xử lý giao dịch thanh toán qua cổng VNPay

## 0.4.1 Kiểm thử chức năng Quản lý khóa học

Chức năng Quản lý khóa học là chức năng cốt lõi của hệ thống, cho phép giảng viên và quản trị viên tạo, chỉnh sửa, quản lý nội dung khóa học, đồng thời cho phép học viên xem, tìm kiếm và truy cập các khóa học. Hệ thống hỗ trợ đầy đủ các thao tác CRUD (Create, Read, Update, Delete) cho khóa học, module và lesson.

**Bảng 41: Kiểm thử chức năng Quản lý khóa học**

| STT | Dữ liệu kiểm thử | Quy trình kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|-----|------------------|---------------------|-------------------|----------------|------------|
| 1 | Tạo khóa học thành công | 1. Đăng nhập với vai trò Teacher/Admin<br>2. Truy cập trang tạo khóa học<br>3. Điền đầy đủ thông tin khóa học (tên, mô tả, giá, danh mục)<br>4. Nhấn "Tạo khóa học" | Khóa học được tạo thành công, hiển thị thông báo "Course created successfully", trạng thái khóa học là PENDING chờ phê duyệt | Khóa học được tạo thành công, hiển thị thông báo "Course created successfully", trạng thái PENDING | Đạt |
| 2 | Tạo khóa học thiếu thông tin bắt buộc | 1. Đăng nhập với vai trò Teacher<br>2. Truy cập trang tạo khóa học<br>3. Để trống tên khóa học hoặc giá<br>4. Nhấn "Tạo khóa học" | Thông báo lỗi yêu cầu nhập đầy đủ thông tin bắt buộc | Thông báo lỗi yêu cầu nhập đầy đủ thông tin bắt buộc | Đạt |
| 3 | Người dùng không có quyền tạo khóa học | 1. Đăng nhập với vai trò Learner<br>2. Truy cập URL trang tạo khóa học | Hiển thị lỗi "Access Denied" hoặc chuyển về trang chủ | Hiển thị lỗi "Access Denied" | Đạt |
| 4 | Sửa khóa học thành công | 1. Đăng nhập với vai trò Teacher (chủ sở hữu khóa học)<br>2. Truy cập trang chỉnh sửa khóa học của mình<br>3. Chỉnh sửa thông tin khóa học<br>4. Nhấn "Lưu" | Khóa học được cập nhật thành công, hiển thị thông báo "Course updated successfully" | Khóa học được cập nhật thành công, hiển thị thông báo "Course updated successfully" | Đạt |
| 5 | Sửa khóa học không phải chủ sở hữu | 1. Đăng nhập với vai trò Teacher<br>2. Nhập URL trang chỉnh sửa khóa học với ID của khóa học tồn tại nhưng không phải do người dùng làm chủ<br>3. Cố gắng chỉnh sửa và lưu | Hiển thị lỗi "You do not have permission to edit this course" | Hiển thị lỗi "You do not have permission to edit this course" | Đạt |
| 6 | Quản lý nội dung khóa học (module và lesson) | 1. Đăng nhập với vai trò Teacher/Admin<br>2. Truy cập trang quản lý khóa học<br>3. Thêm module, thêm lesson vào module<br>4. Sửa và xóa module/lesson | Module và lesson được thêm, sửa, xóa thành công, hiển thị trong danh sách | Module và lesson được quản lý thành công | Đạt |
| 7 | Phê duyệt/từ chối khóa học (Admin) | 1. Đăng nhập với vai trò Admin<br>2. Truy cập trang quản lý khóa học<br>3. Xem danh sách khóa học PENDING<br>4. Chọn khóa học và nhấn "Phê duyệt" hoặc "Từ chối" | Khóa học chuyển sang trạng thái APPROVED hoặc REJECTED tương ứng | Khóa học chuyển trạng thái đúng | Đạt |
| 8 | Hiển thị và tìm kiếm khóa học (học viên) | 1. Đăng nhập với vai trò Learner hoặc không đăng nhập<br>2. Truy cập trang danh sách khóa học<br>3. Tìm kiếm khóa học bằng từ khóa<br>4. Click xem chi tiết khóa học | Hiển thị danh sách khóa học APPROVED, tìm kiếm hoạt động, hiển thị đầy đủ thông tin khóa học | Hiển thị và tìm kiếm khóa học hoạt động đúng | Đạt |
| 9 | Học viên xem khóa học đã mua/chưa mua | 1. Đăng nhập với vai trò Learner<br>2. Truy cập trang chi tiết khóa học đã mua và chưa mua | Khóa học đã mua: hiển thị nút "Vào học", có thể xem nội dung<br>Khóa học chưa mua: hiển thị nút "Mua khóa học", không thể xem nội dung | Phân biệt đúng khóa học đã mua/chưa mua | Đạt |

Chức năng Quản lý khóa học có 9 ca kiểm thử, bao gồm 3 trường hợp không hợp lệ và 6 trường hợp hợp lệ. Hệ thống tạo ra kết quả đúng, khớp với kết quả mong đợi trong mọi ca kiểm thử. Tất cả các ca kiểm thử đều đạt, cho thấy chức năng Quản lý khóa học hoạt động ổn định, đảm bảo tính toàn vẹn dữ liệu và phân quyền đúng đắn.

## 0.4.2 Kiểm thử chức năng Thực thi mã nguồn

Chức năng Thực thi mã nguồn là một trong những chức năng quan trọng nhất của hệ thống giảng dạy lập trình, cho phép học viên viết, chạy và nộp mã nguồn. Hệ thống tích hợp với Judge0 API để thực thi mã trong môi trường sandbox an toàn và đánh giá kết quả tự động. Học viên có thể chạy mã trước khi nộp và xem kết quả chi tiết theo từng test case.

**Bảng 42: Kiểm thử chức năng Thực thi mã nguồn**

| STT | Dữ liệu kiểm thử | Quy trình kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|-----|------------------|---------------------|-------------------|----------------|------------|
| 1 | Người dùng chưa đăng nhập hoặc chưa mua khóa học | 1. Không đăng nhập hoặc đăng nhập nhưng chưa mua khóa học<br>2. Truy cập URL trang bài học code hoặc bài tập code | Yêu cầu đăng nhập hoặc thông báo "You need to purchase the course to access this lesson" | Yêu cầu đăng nhập hoặc thông báo lỗi phù hợp | Đạt |
| 2 | Bài học/bài tập không tồn tại hoặc chưa cấu hình | 1. Đăng nhập với vai trò Learner đã mua khóa học<br>2. Truy cập URL bài học/bài tập không tồn tại hoặc chưa cấu hình Judge0/test case | Lỗi: "Lesson not found" hoặc "Bài học chưa được cấu hình ngôn ngữ Judge0" | Lỗi phù hợp được hiển thị | Đạt |
| 3 | Mã có lỗi cú pháp | 1. Đăng nhập với vai trò Learner đã mua khóa học<br>2. Mở bài học code<br>3. Nhập mã có lỗi cú pháp (ví dụ: thiếu dấu ngoặc, sai từ khóa)<br>4. Nhấn "Chạy code" | Hiển thị lỗi cú pháp từ Judge0 (ví dụ: "SyntaxError", "Compilation Error") trong phần stderr hoặc compile_output | Hiển thị lỗi cú pháp từ Judge0 | Đạt |
| 4 | Chạy được nhưng sai test case | 1. Đăng nhập với vai trò Learner đã mua khóa học<br>2. Mở bài học code<br>3. Nhập mã chạy được nhưng output không khớp expected output<br>4. Nhấn "Chạy code" | Hiển thị "Failed" kèm thông tin: input, expected output, actual output, status description | Hiển thị "Failed" với thông tin chi tiết | Đạt |
| 5 | Đúng một số test case | 1. Đăng nhập với vai trò Learner đã mua khóa học<br>2. Mở bài học code<br>3. Nhập mã qua một số test nhưng fail một số test khác<br>4. Nhấn "Chạy code" | Hiển thị số test pass/fail, làm nổi bật test pass (màu xanh) và fail (màu đỏ), hiển thị thông báo "Một số test case chưa đạt" | Hiển thị số test pass/fail, phân biệt màu sắc, thông báo "Một số test case chưa đạt" | Đạt |
| 6 | Qua tất cả test case | 1. Đăng nhập với vai trò Learner đã mua khóa học<br>2. Mở bài học code<br>3. Nhập mã qua tất cả test<br>4. Nhấn "Chạy code" | Hiển thị "Tất cả test case đã vượt qua", tất cả test case hiển thị màu xanh, tự động đánh dấu bài học đã hoàn thành | Hiển thị "Tất cả test case đã vượt qua", tất cả test pass, đánh dấu hoàn thành | Đạt |
| 7 | Lỗi kết nối Judge0 API hoặc timeout | 1. Đăng nhập với vai trò Learner đã mua khóa học<br>2. Mở bài học code<br>3. Nhập mã nguồn<br>4. Nhấn "Chạy code" (Judge0 không phản hồi hoặc mã chạy quá lâu) | Lỗi: "Không thể kết nối đến Judge0 CE" hoặc "Time Limit Exceeded" | Lỗi phù hợp được hiển thị | Đạt |
| 8 | Chạy code trong các ngữ cảnh khác nhau | 1. Đăng nhập với vai trò Learner đã mua khóa học<br>2. Mở bài học code, bài tập CodeExercise, hoặc đề thi có câu hỏi code<br>3. Nhập mã nguồn<br>4. Nhấn "Chạy code" hoặc "Chạy test" | Hệ thống gọi API đúng tương ứng, hiển thị kết quả chi tiết từng test case | Hệ thống gọi API đúng, hiển thị kết quả | Đạt |
| 9 | Hiển thị thông tin chi tiết và test case ẩn | 1. Đăng nhập với vai trò Learner đã mua khóa học<br>2. Mở bài học code có test case ẩn<br>3. Nhập mã và chạy<br>4. Xem kết quả | Hiển thị đầy đủ thông tin test case công khai, test case ẩn chỉ hiển thị passed/failed | Hiển thị thông tin đúng cho test case công khai và ẩn | Đạt |

Chức năng Thực thi mã nguồn có 9 ca kiểm thử, bao gồm 3 trường hợp không hợp lệ và 6 trường hợp hợp lệ. Hệ thống tạo ra kết quả đúng, khớp với kết quả mong đợi trong mọi ca kiểm thử. Tất cả các ca kiểm thử đều đạt, đảm bảo chức năng Thực thi mã nguồn hoạt động ổn định, tích hợp tốt với Judge0 API và cung cấp phản hồi chính xác cho người học.

## 0.4.3 Kiểm thử chức năng Thanh toán khóa học

Chức năng Thanh toán khóa học là chức năng quan trọng vì liên quan đến giao dịch tài chính và quyền truy cập nội dung học tập. Hệ thống tích hợp với cổng thanh toán VNPay để xử lý các giao dịch thanh toán trực tuyến một cách an toàn và đáng tin cậy. Hệ thống hỗ trợ thanh toán đơn lẻ và thanh toán từ giỏ hàng (nhiều khóa học).

**Bảng 43: Kiểm thử chức năng Thanh toán khóa học**

| STT | Dữ liệu kiểm thử | Quy trình kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|-----|------------------|---------------------|-------------------|----------------|------------|
| 1 | Khóa học đã mua hoặc người dùng chưa đăng nhập | 1. Đăng nhập với vai trò Learner, chọn khóa học đã mua, nhấn "Pay"<br>Hoặc không đăng nhập, truy cập trang khóa học, nhấn "Buy course" | Thông báo: "User already enrolled to this course" hoặc yêu cầu đăng nhập | Thông báo lỗi phù hợp | Đạt |
| 2 | Khóa học không tồn tại hoặc token hết hạn | 1. Đăng nhập với vai trò Learner<br>2. Truy cập URL khóa học không tồn tại hoặc token hết hạn khi thanh toán<br>3. Nhấn "Pay" | Lỗi: "Course not found" hoặc "Session has expired" | Lỗi phù hợp được hiển thị | Đạt |
| 3 | Thanh toán VNPay thành công (đơn lẻ) | 1. Đăng nhập với vai trò Learner<br>2. Chọn khóa học chưa mua<br>3. Nhấn "Pay"<br>4. Chọn ngân hàng trên VNPay<br>5. Hoàn tất thanh toán trên VNPay | Chuyển đến trang kết quả thanh toán trạng thái "Success", khóa học được mở khóa (enroll), hiển thị thông báo thành công | Chuyển đến trang kết quả "Success", khóa học được enroll | Đạt |
| 4 | Người dùng hủy thanh toán hoặc hết thời gian | 1. Đăng nhập với vai trò Learner<br>2. Chọn khóa học chưa mua<br>3. Nhấn "Pay"<br>4. Hủy giao dịch trên VNPay hoặc không hoàn tất trong 15 phút | Chuyển đến trang kết quả "Failed" hoặc "Transaction has expired", khóa học không được mở khóa | Chuyển đến trang kết quả "Failed", khóa học không được enroll | Đạt |
| 5 | Thanh toán từ giỏ hàng (nhiều khóa học) | 1. Đăng nhập với vai trò Learner<br>2. Thêm nhiều khóa học vào giỏ hàng<br>3. Nhấn "Checkout"<br>4. Hoàn tất thanh toán trên VNPay | Tất cả khóa học trong giỏ được mở khóa sau khi thanh toán thành công, giỏ hàng được xóa | Tất cả khóa học được enroll, giỏ hàng được xóa | Đạt |
| 6 | Lỗi kết nối VNPay hoặc xác thực chữ ký thất bại | 1. Đăng nhập với vai trò Learner<br>2. Chọn khóa học chưa mua<br>3. Nhấn "Pay" (không thể kết nối VNPay hoặc chữ ký không hợp lệ) | Lỗi: "Cannot connect to the payment gateway" hoặc "Invalid transaction", giao dịch bị từ chối | Lỗi phù hợp được hiển thị | Đạt |
| 7 | Thanh toán khóa học miễn phí | 1. Đăng nhập với vai trò Learner<br>2. Chọn khóa học có giá = 0<br>3. Nhấn "Enroll" hoặc "Get course" | Khóa học được mở khóa ngay lập tức mà không cần thanh toán, không chuyển đến VNPay | Khóa học được enroll ngay, không qua VNPay | Đạt |
| 8 | Xử lý callback từ VNPay (IPN và Return URL) | 1. Sau khi thanh toán trên VNPay<br>2. VNPay gửi IPN callback và redirect về return URL<br>3. Hệ thống nhận và xử lý thông tin | Hệ thống xác thực thông tin từ VNPay, cập nhật trạng thái thanh toán, enroll khóa học nếu thành công | Hệ thống xử lý callback đúng, enroll khóa học | Đạt |
| 9 | Xem lịch sử thanh toán | 1. Đăng nhập với vai trò Learner<br>2. Truy cập trang lịch sử thanh toán | Hiển thị danh sách tất cả giao dịch thanh toán của người dùng: ngày, khóa học, số tiền, trạng thái | Hiển thị danh sách lịch sử thanh toán đầy đủ | Đạt |

Chức năng Thanh toán khóa học có 9 ca kiểm thử, bao gồm 3 trường hợp không hợp lệ và 6 trường hợp hợp lệ. Hệ thống tạo ra kết quả đúng, khớp với kết quả mong đợi trong mọi ca kiểm thử. Tất cả các ca kiểm thử đều đạt, đảm bảo tính an toàn, độ tin cậy và tính toàn vẹn của quy trình thanh toán. Hệ thống xử lý đúng các trường hợp edge case như timeout, hủy giao dịch, và xác thực chữ ký, đảm bảo bảo mật cho cả người dùng và hệ thống.

## Tổng kết kiểm thử

Sinh viên đã thực hiện kiểm thử cho ba chức năng quan trọng nhất của hệ thống với tổng cộng **27 ca kiểm thử**:

- **Quản lý khóa học**: 9 ca kiểm thử (3 không hợp lệ, 6 hợp lệ)
- **Thực thi mã nguồn**: 9 ca kiểm thử (3 không hợp lệ, 6 hợp lệ)
- **Thanh toán khóa học**: 9 ca kiểm thử (3 không hợp lệ, 6 hợp lệ)

**Kết quả tổng hợp:**
- Tổng số ca kiểm thử: **27**
- Số ca kiểm thử đạt: **27** (100%)
- Số ca kiểm thử không đạt: **0** (0%)

Tất cả các chức năng quan trọng đã được kiểm thử đầy đủ và sẵn sàng để triển khai trong môi trường thực tế. Hệ thống đảm bảo hoạt động ổn định, xử lý đúng các tình huống lỗi và edge case, đáp ứng yêu cầu về bảo mật, hiệu năng và trải nghiệm người dùng.
