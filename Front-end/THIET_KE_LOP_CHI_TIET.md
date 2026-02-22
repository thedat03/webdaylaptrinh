# 4.2.2 Thiết kế lớp

Phần này trình bày thiết kế chi tiết các thuộc tính và phương thức cho các lớp chủ đạo trong hệ thống quản lý học tập trực tuyến. Hệ thống được xây dựng theo kiến trúc phân lớp (layered architecture), đảm bảo tách biệt giữa dữ liệu (Entity), logic nghiệp vụ (Service), và giao tiếp (Controller).

Dưới đây là thiết kế chi tiết của bốn lớp quan trọng nhất: User, Course, Learning, và Payment.

## Hình 4.9: Thiết kế chi tiết các lớp Entity

```
┌─────────────────────────────────────────────────────────┐
│                    Entity Classes                       │
│                                                         │
│  ┌──────────────────────────────────────────────┐     │
│  │  User                                        │     │
│  │  + id: UUID                                  │     │
│  │  + username: String                          │     │
│  │  + email: String                             │     │
│  │  + password: String                          │     │
│  │  + role: UserRole                            │     │
│  │  + isActive: Boolean                         │     │
│  │  + createdAt: LocalDateTime                  │     │
│  │  + updatedAt: LocalDateTime                  │     │
│  │  + lastActiveAt: LocalDateTime               │     │
│  │  + onCreate(): void                          │     │
│  │  + onUpdate(): void                          │     │
│  └──────────────────────────────────────────────┘     │
│                                                         │
│  ┌──────────────────────────────────────────────┐     │
│  │  Course                                      │     │
│  │  + course_id: UUID                           │     │
│  │  + course_name: String                        │     │
│  │  + price: int                                 │     │
│  │  + status: CourseStatus                       │     │
│  │  + totalDurationMinutes: Integer (transient) │     │
│  │  + lessonsCount: Integer (transient)          │     │
│  │  + commentsCount: Integer (transient)         │     │
│  │  + rating: Double (transient)                 │     │
│  │  + computeStatistics(comments: List<Comment>):│     │
│  │    void                                       │     │
│  └──────────────────────────────────────────────┘     │
│                                                         │
│  ┌──────────────────────────────────────────────┐     │
│  │  Learning                                    │     │
│  │  + id: UUID                                  │     │
│  │  + enrolledAt: LocalDateTime                 │     │
│  │  + onCreate(): void                          │     │
│  └──────────────────────────────────────────────┘     │
│                                                         │
│  ┌──────────────────────────────────────────────┐     │
│  │  Payment                                     │     │
│  │  + id: UUID                                  │     │
│  │  + amount: long                              │     │
│  │  + txnRef: String                            │     │
│  │  + status: PaymentStatus                     │     │
│  │  + responseCode: String                      │     │
│  │  + transactionNo: String                     │     │
│  │  + payDate: LocalDateTime                     │     │
│  │  + createdAt: LocalDateTime                  │     │
│  │  + updatedAt: LocalDateTime                   │     │
│  │  + onCreate(): void                           │     │
│  │  + onUpdate(): void                           │     │
│  └──────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## Bảng 4.1: Thiết kế chi tiết lớp User

| STT | Tên trường, phương thức | Kiểu dữ liệu, kiểu trả về | Mô tả |
|-----|------------------------|---------------------------|-------|
| 1 | `id` | `UUID` | Định danh duy nhất của người dùng trong hệ thống |
| 2 | `username` | `String` | Tên đăng nhập của người dùng |
| 3 | `email` | `String` | Địa chỉ email của người dùng, dùng cho xác thực và giao tiếp |
| 4 | `password` | `String` | Mật khẩu đã được hash của người dùng |
| 5 | `mobileNumber` | `String` | Số điện thoại của người dùng |
| 6 | `role` | `UserRole` | Vai trò của người dùng trong hệ thống (USER, INSTRUCTOR, TA, ADMIN) |
| 7 | `isActive` | `Boolean` | Trạng thái hoạt động của tài khoản người dùng |
| 8 | `dob` | `String` | Ngày sinh của người dùng |
| 9 | `gender` | `String` | Giới tính của người dùng |
| 10 | `location` | `String` | Thông tin khu vực sinh sống của người dùng |
| 11 | `profession` | `String` | Nghề nghiệp của người dùng |
| 12 | `linkedin_url` | `String` | URL hồ sơ LinkedIn của người dùng |
| 13 | `github_url` | `String` | URL hồ sơ GitHub của người dùng |
| 14 | `profileImage` | `byte[]` | Ảnh đại diện của người dùng |
| 15 | `createdAt` | `LocalDateTime` | Thời gian tạo tài khoản |
| 16 | `updatedAt` | `LocalDateTime` | Thời gian cập nhật thông tin người dùng gần nhất |
| 17 | `lastActiveAt` | `LocalDateTime` | Thời gian người dùng hoạt động gần nhất trên hệ thống |
| 18 | `onCreate()` | `void` | Phương thức được gọi khi tạo người dùng mới. Khởi tạo các giá trị thời gian như createdAt, updatedAt, và lastActiveAt |
| 19 | `onUpdate()` | `void` | Phương thức được gọi khi cập nhật thông tin người dùng. Cập nhật giá trị updatedAt |

**Giải thích lớp User:**

Lớp User quản lý và lưu trữ thông tin người dùng, hỗ trợ xác thực, phân quyền và theo dõi hoạt động người dùng. Lớp này bao gồm các thuộc tính cơ bản như thông tin đăng nhập, thông tin cá nhân, và các trường metadata để quản lý vòng đời tài khoản.

## Bảng 4.2: Thiết kế chi tiết lớp Course

| STT | Tên trường, phương thức | Kiểu dữ liệu, kiểu trả về | Mô tả |
|-----|------------------------|---------------------------|-------|
| 1 | `course_id` | `UUID` | Định danh duy nhất của khóa học trong hệ thống |
| 2 | `course_name` | `String` | Tên khóa học |
| 3 | `price` | `int` | Giá bán của khóa học (VND) |
| 4 | `instructor` | `String` | Tên giảng viên hiển thị cho khóa học |
| 5 | `description` | `String` | Mô tả khóa học |
| 6 | `learningOutcomes` | `String` | Kết quả học tập sau khi hoàn thành khóa học (định dạng JSON) |
| 7 | `p_link` | `String` | Liên kết tài liệu PDF của khóa học |
| 8 | `y_link` | `String` | Liên kết video YouTube của khóa học |
| 9 | `tags` | `String` | Nhãn/từ khóa để hỗ trợ tìm kiếm và phân loại |
| 10 | `status` | `CourseStatus` | Trạng thái khóa học (PENDING/APPROVED/REJECTED) |
| 11 | `plannedDays` | `Integer` | Số ngày học dự kiến để hoàn thành khóa học |
| 12 | `totalDurationMinutes` | `Integer` (transient) | Tổng thời lượng khóa học (phút), được tính toán động |
| 13 | `lessonsCount` | `Integer` (transient) | Tổng số bài học, được tính toán động |
| 14 | `commentsCount` | `Integer` (transient) | Tổng số bình luận hợp lệ, được tính toán động |
| 15 | `rating` | `Double` (transient) | Điểm đánh giá trung bình của khóa học, được tính toán động |
| 16 | `computeStatistics(comments: List<Comment>)` | `void` | Phương thức tính toán các thống kê hiển thị cho khóa học, bao gồm totalDurationMinutes, lessonsCount, commentsCount, và rating, dựa trên dữ liệu bài học và danh sách bình luận/đánh giá |

**Giải thích lớp Course:**

Lớp Course lưu trữ thông tin khóa học để hỗ trợ hiển thị nội dung, phân loại, trạng thái phê duyệt, và tính toán thống kê (thời lượng, số bài học, đánh giá, v.v.). Các trường transient (totalDurationMinutes, lessonsCount, commentsCount, rating) được tính toán động từ dữ liệu liên quan và không được lưu trực tiếp trong cơ sở dữ liệu.

## Bảng 4.3: Thiết kế chi tiết lớp Learning

| STT | Tên trường, phương thức | Kiểu dữ liệu, kiểu trả về | Mô tả |
|-----|------------------------|---------------------------|-------|
| 1 | `id` | `UUID` | Định danh duy nhất cho mỗi bản ghi đăng ký khóa học |
| 2 | `enrolledAt` | `LocalDateTime` | Thời gian người dùng đăng ký khóa học |
| 3 | `onCreate()` | `void` | Phương thức được gọi khi tạo bản ghi đăng ký mới. Tự động gán enrolledAt bằng thời gian hiện tại nếu chưa được thiết lập |

**Giải thích lớp Learning:**

Lớp Learning quản lý việc đăng ký khóa học của người dùng và lưu trữ thời gian đăng ký. Lớp này tạo mối quan hệ nhiều-nhiều giữa User và Course, cho phép một người dùng đăng ký nhiều khóa học và một khóa học có nhiều người học.

## Bảng 4.4: Thiết kế chi tiết lớp Payment

| STT | Tên trường, phương thức | Kiểu dữ liệu, kiểu trả về | Mô tả |
|-----|------------------------|---------------------------|-------|
| 1 | `id` | `UUID` | Định danh duy nhất của giao dịch thanh toán |
| 2 | `amount` | `long` | Số tiền thanh toán (VND) |
| 3 | `currency` | `String` | Loại tiền tệ (ví dụ: VND) |
| 4 | `txnRef` | `String` | Mã tham chiếu duy nhất cho mỗi giao dịch |
| 5 | `orderInfo` | `String` | Nội dung mô tả đơn hàng |
| 6 | `orderType` | `String` | Loại đơn hàng dựa trên cấu hình thanh toán |
| 7 | `locale` | `String` | Ngôn ngữ giao diện thanh toán |
| 8 | `bankCode` | `String` | Mã ngân hàng được chọn (nếu có) |
| 9 | `ipAddress` | `String` | Địa chỉ IP của người dùng khi thanh toán |
| 10 | `status` | `PaymentStatus` | Trạng thái thanh toán (PENDING/PAID/FAILED) |
| 11 | `responseCode` | `String` | Mã phản hồi trả về từ cổng thanh toán (VNPay) |
| 12 | `transactionStatus` | `String` | Trạng thái giao dịch trả về từ VNPay |
| 13 | `transactionNo` | `String` | Số giao dịch do VNPay cấp |
| 14 | `payDate` | `LocalDateTime` | Thời gian thanh toán thành công |
| 15 | `createdAt` | `LocalDateTime` | Thời gian tạo giao dịch |
| 16 | `updatedAt` | `LocalDateTime` | Thời gian cập nhật giao dịch gần nhất |
| 17 | `onCreate()` | `void` | Phương thức được gọi khi tạo giao dịch thanh toán mới. Tự động gán createdAt và updatedAt bằng thời gian hiện tại |
| 18 | `onUpdate()` | `void` | Phương thức được gọi khi cập nhật giao dịch (ví dụ: cập nhật trạng thái). Tự động cập nhật updatedAt |

**Giải thích lớp Payment:**

Lớp Payment quản lý thông tin giao dịch thanh toán (tích hợp VNPay), lưu trữ trạng thái giao dịch và thông tin phản hồi liên quan. Lớp này hỗ trợ theo dõi toàn bộ vòng đời của giao dịch từ khi tạo đến khi hoàn tất, bao gồm các thông tin cần thiết để đối soát và xử lý khiếu nại.

## Hình 4.10: Thiết kế chi tiết lớp CourseService và LearningService

```
┌─────────────────────────────────────────────────────────┐
│              Service Layer Classes                      │
│                                                         │
│  ┌──────────────────────────────────────────────┐     │
│  │  CourseService                               │     │
│  │  - courseRepository: CourseRepository        │     │
│  │  - moduleRepository: CourseModuleRepository   │     │
│  │  - lessonRepository: LessonRepository         │     │
│  │  - commentRepository: CommentRepository      │     │
│  │  + getAllCourses(): List<Course>              │     │
│  │  + getAllCoursesFiltered(categoryId, free):   │     │
│  │    List<Course>                               │     │
│  │  + createCourse(course, creatorUserId): Course│     │
│  │  + updateCourse(id, updatedCourse): Course    │     │
│  │  + deleteCourse(id): void                     │     │
│  │  + loadCourseStatistics(course): void         │     │
│  └──────────────────────────────────────────────┘     │
│                                                         │
│  ┌──────────────────────────────────────────────┐     │
│  │  LearningService                             │     │
│  │  - learningRepository: LearningRepository    │     │
│  │  - userRepository: UserRepository            │     │
│  │  - courseRepository: CourseRepository        │     │
│  │  + getLearningCourses(userId): List<Course>  │     │
│  │  + enrollCourse(enrollRequest): String       │     │
│  │  + enrollUserInCourse(user, course): Learning│     │
│  │  + isUserEnrolled(user, course): boolean     │     │
│  └──────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## Bảng 4.5: Thiết kế chi tiết lớp CourseService

| STT | Tên trường, phương thức | Kiểu dữ liệu, kiểu trả về | Mô tả |
|-----|------------------------|---------------------------|-------|
| 1 | `courseRepository` | `CourseRepository` | Repository để truy cập dữ liệu khóa học |
| 2 | `moduleRepository` | `CourseModuleRepository` | Repository để truy cập dữ liệu module |
| 3 | `lessonRepository` | `LessonRepository` | Repository để truy cập dữ liệu bài học |
| 4 | `commentRepository` | `CommentRepository` | Repository để truy cập dữ liệu bình luận |
| 5 | `getAllCourses()` | `List<Course>` | Lấy về danh sách tất cả khóa học, tải dữ liệu liên quan và tính toán thống kê cho mỗi khóa học |
| 6 | `getAllCoursesFiltered(categoryId, free)` | `List<Course>` | Lấy về các khóa học đã được duyệt và lọc theo danh mục hoặc điều kiện miễn phí/trả phí |
| 7 | `createCourse(course, creatorUserId)` | `Course` | Tạo khóa học mới do giảng viên tạo, đặt trạng thái mặc định là PENDING và lưu vào hệ thống |
| 8 | `updateCourse(id, updatedCourse)` | `Course` | Cập nhật thông tin khóa học theo ID, xử lý thay đổi dữ liệu và lưu |
| 9 | `deleteCourse(id)` | `void` | Xóa khóa học và tất cả dữ liệu liên quan theo đúng thứ tự phụ thuộc |
| 10 | `loadCourseStatistics(course)` | `void` | Tải dữ liệu module, bài học và bình luận, sau đó tính toán thống kê hiển thị cho khóa học |

**Giải thích lớp CourseService:**

Lớp CourseService xử lý các thao tác nghiệp vụ liên quan đến quản lý khóa học trong hệ thống. Lớp này sử dụng các repository để truy cập dữ liệu và thực hiện logic nghiệp vụ như tính toán thống kê, lọc và tìm kiếm khóa học.

## Bảng 4.6: Thiết kế chi tiết lớp LearningService

| STT | Tên trường, phương thức | Kiểu dữ liệu, kiểu trả về | Mô tả |
|-----|------------------------|---------------------------|-------|
| 1 | `learningRepository` | `LearningRepository` | Repository để truy cập dữ liệu đăng ký khóa học |
| 2 | `userRepository` | `UserRepository` | Repository để truy cập dữ liệu người dùng |
| 3 | `courseRepository` | `CourseRepository` | Repository để truy cập dữ liệu khóa học |
| 4 | `getLearningCourses(userId)` | `List<Course>` | Lấy về danh sách các khóa học mà người dùng đã đăng ký hoặc được phân công (TA) |
| 5 | `enrollCourse(enrollRequest)` | `String` | Thực hiện đăng ký khóa học dựa trên yêu cầu của người dùng |
| 6 | `enrollUserInCourse(user, course)` | `Learning` | Xác thực và tạo bản ghi đăng ký khóa học cùng tiến độ học tập cho người dùng |
| 7 | `isUserEnrolled(user, course)` | `boolean` | Kiểm tra xem người dùng có quyền học khóa học hay không |

**Giải thích lớp LearningService:**

Lớp LearningService xử lý các thao tác nghiệp vụ liên quan đến đăng ký khóa học và tham gia học tập. Lớp này quản lý mối quan hệ giữa người dùng và khóa học, đảm bảo người dùng chỉ có thể truy cập các khóa học mà họ đã đăng ký hoặc được phân công.
