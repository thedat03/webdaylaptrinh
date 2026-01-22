# Giải thích: Tại sao Entity chỉ cần các phương thức đó?

## Câu hỏi thường gặp

**"Tại sao Entity chỉ có onCreate(), onUpdate(), computeStatistics() mà không có các phương thức như createCourse(), enrollCourse(), createPayment()...?"**

**Trả lời:** Đây là do **kiến trúc phân lớp (Layered Architecture)** - các chức năng đó được xử lý ở **Service Layer**, không phải Entity Layer.

---

## 1. Kiến trúc phân lớp (Layered Architecture)

Hệ thống được chia thành các lớp với trách nhiệm riêng:

```
┌─────────────────────────────────────┐
│     Controller Layer (API)          │  ← Nhận request từ client
├─────────────────────────────────────┤
│     Service Layer (Business Logic)  │  ← Xử lý nghiệp vụ
├─────────────────────────────────────┤
│     Entity Layer (Data Model)        │  ← Chỉ chứa dữ liệu
├─────────────────────────────────────┤
│     Repository Layer (Database)      │  ← Truy cập database
└─────────────────────────────────────┘
```

---

## 2. Entity Layer - Trách nhiệm là gì?

### Entity chỉ có trách nhiệm:
1. ✅ **Định nghĩa cấu trúc dữ liệu** (thuộc tính)
2. ✅ **Lifecycle methods** (onCreate, onUpdate) - tự động thiết lập giá trị khi lưu/cập nhật
3. ✅ **Phương thức tính toán đơn giản** (như computeStatistics) - chỉ tính toán trên dữ liệu của chính nó

### Entity KHÔNG có trách nhiệm:
1. ❌ **Business logic phức tạp** (tạo khóa học, đăng ký, thanh toán...)
2. ❌ **Truy cập database** (query, save, delete...)
3. ❌ **Xử lý giao dịch** (transaction management)
4. ❌ **Tích hợp với hệ thống bên ngoài** (VNPay, email...)
5. ❌ **Validation phức tạp**
6. ❌ **Xử lý lỗi và exception**

---

## 3. Các chức năng được xử lý ở đâu?

### Ví dụ: Chức năng "Đăng ký khóa học"

#### ❌ KHÔNG đặt trong Entity Learning:
```java
// SAI - Không nên đặt trong Entity
public class Learning {
    public void enrollUserInCourse(User user, Course course) {
        // Kiểm tra user đã đăng ký chưa
        // Tạo Progress record
        // Gửi thông báo
        // ...
    }
}
```

#### ✅ ĐÚNG - Đặt trong Service Layer:
```java
// ĐÚNG - Đặt trong LearningService
@Service
public class LearningService {
    public Learning enrollUserInCourse(User user, Course course) {
        // Kiểm tra đã đăng ký chưa
        Learning existing = learningRepository.findByUserAndCourse(user, course);
        if (existing != null) {
            return null;
        }
        
        // Tạo Progress record
        Progress progress = new Progress();
        progress.setUser(user);
        progress.setCourse(course);
        progressRepository.save(progress);
        
        // Tạo Learning record
        Learning learning = new Learning();
        learning.setUser(user);
        learning.setCourse(course);
        return learningRepository.save(learning);
    }
}
```

---

## 4. So sánh: Entity vs Service

### Entity (Lớp dữ liệu)

**Ví dụ: Lớp Course**

```java
@Entity
public class Course {
    // Thuộc tính
    private UUID course_id;
    private String course_name;
    private int price;
    // ...
    
    // Lifecycle methods
    @PrePersist
    protected void onCreate() { ... }
    
    // Phương thức tính toán đơn giản
    public void computeStatistics(List<Comment> comments) {
        // Chỉ tính toán trên dữ liệu của chính nó
    }
}
```

**Trách nhiệm:**
- ✅ Định nghĩa cấu trúc dữ liệu
- ✅ Tự động thiết lập giá trị (onCreate, onUpdate)
- ✅ Tính toán thống kê từ dữ liệu của chính nó

---

### Service (Lớp nghiệp vụ)

**Ví dụ: CourseService**

```java
@Service
public class CourseService {
    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final NotificationService notificationService;
    
    // Business logic: Tạo khóa học
    public Course createCourse(Course course, UUID creatorUserId) {
        // 1. Load Category
        Category cat = categoryRepository.findById(...);
        
        // 2. Gắn User (giảng viên)
        User creator = userRepository.findById(creatorUserId);
        course.setUser(creator);
        
        // 3. Thiết lập status
        course.setStatus(CourseStatus.PENDING);
        
        // 4. Lưu vào database
        Course saved = courseRepository.save(course);
        
        // 5. Gửi thông báo cho admin
        notificationService.notifyNewCourse(saved);
        
        return saved;
    }
    
    // Business logic: Xóa khóa học
    @Transactional
    public void deleteCourse(UUID id) {
        // Xóa tuần tự các bản ghi liên quan
        // 1. payment_orders
        // 2. Learning records
        // 3. Payment records
        // ... (10 bước)
        courseRepository.deleteById(id);
    }
    
    // Business logic: Tìm kiếm khóa học
    public List<Course> searchCourses(String keyword) {
        // Xử lý logic tìm kiếm phức tạp
        // Lọc theo status
        // Tính toán statistics
        // ...
    }
}
```

**Trách nhiệm:**
- ✅ Xử lý business logic phức tạp
- ✅ Tương tác với nhiều Entity/Repository
- ✅ Quản lý transaction
- ✅ Tích hợp với các Service khác
- ✅ Xử lý lỗi và validation

---

## 5. Các chức năng trong hệ thống được xử lý ở đâu?

### Bảng phân công trách nhiệm:

| Chức năng | Xử lý ở đâu? | Ví dụ |
|-----------|--------------|-------|
| **Tạo khóa học** | ✅ CourseService | `createCourse()` |
| **Cập nhật khóa học** | ✅ CourseService | `updateCourse()` |
| **Xóa khóa học** | ✅ CourseService | `deleteCourse()` |
| **Tìm kiếm khóa học** | ✅ CourseService | `searchCourses()` |
| **Phê duyệt khóa học** | ✅ CourseService | `approveCourse()` |
| **Đăng ký khóa học** | ✅ LearningService | `enrollCourse()` |
| **Kiểm tra đã đăng ký** | ✅ LearningService | `isUserEnrolled()` |
| **Lấy danh sách khóa học đã đăng ký** | ✅ LearningService | `getLearningCourses()` |
| **Tạo thanh toán** | ✅ PaymentService | `createPayment()` |
| **Xử lý callback VNPay** | ✅ PaymentService | `handleReturn()` |
| **Tích hợp VNPay** | ✅ PaymentService | `createPaymentUrl()` |
| **Tính toán thống kê khóa học** | ✅ Course.computeStatistics() | Phương thức trong Entity |
| **Tự động thiết lập thời gian** | ✅ User.onCreate() | Lifecycle method trong Entity |

---

## 6. Tại sao thiết kế như vậy?

### 6.1. Nguyên tắc Single Responsibility (SRP)

**Mỗi lớp chỉ có một trách nhiệm:**

- **Entity**: Chỉ quản lý dữ liệu
- **Service**: Chỉ xử lý business logic
- **Repository**: Chỉ truy cập database
- **Controller**: Chỉ nhận request và trả response

### 6.2. Tách biệt mối quan tâm (Separation of Concerns)

- **Dễ bảo trì**: Thay đổi business logic không ảnh hưởng đến Entity
- **Dễ test**: Test Entity và Service riêng biệt
- **Dễ mở rộng**: Thêm business logic mới không cần sửa Entity
- **Tái sử dụng**: Entity có thể dùng ở nhiều Service khác nhau

### 6.3. Ví dụ minh họa

**Nếu đặt business logic vào Entity:**

```java
// SAI - Entity quá phức tạp
public class Course {
    public Course createCourse(...) {
        // Load Category
        // Gắn User
        // Gửi thông báo
        // Lưu database
        // ... (quá nhiều trách nhiệm)
    }
}
```

**Vấn đề:**
- Entity phụ thuộc vào Repository, Service khác
- Khó test
- Vi phạm SRP
- Khó tái sử dụng

**Đặt business logic vào Service:**

```java
// ĐÚNG - Tách biệt rõ ràng
@Service
public class CourseService {
    public Course createCourse(...) {
        // Business logic ở đây
    }
}

@Entity
public class Course {
    // Chỉ chứa dữ liệu
}
```

**Lợi ích:**
- Entity đơn giản, chỉ chứa dữ liệu
- Service xử lý logic phức tạp
- Dễ test và bảo trì

---

## 7. Trong thiết kế của bạn

### Phần 4.2.2 - Thiết kế lớp

**4.2.2.1 - 4.2.2.4: Entity Layer** ✅
- Chỉ mô tả Entity (User, Course, Learning, Payment)
- Chỉ có lifecycle methods và phương thức tính toán đơn giản
- **ĐÚNG** - Phù hợp với trách nhiệm của Entity

**4.2.2.5 - 4.2.2.6: Service Layer** ✅
- CourseService: `createCourse()`, `updateCourse()`, `deleteCourse()`, `searchCourses()`...
- LearningService: `enrollCourse()`, `isUserEnrolled()`, `getLearningCourses()`...
- **ĐÚNG** - Các chức năng business logic được mô tả ở đây

**4.2.2.7: Biểu đồ trình tự** ✅
- Mô tả luồng xử lý giữa các lớp
- Thể hiện rõ Entity, Service, Controller tương tác như thế nào

---

## 8. Kết luận

### ✅ Entity chỉ cần:
1. **Lifecycle methods** (onCreate, onUpdate) - Tự động thiết lập giá trị
2. **Phương thức tính toán đơn giản** (computeStatistics) - Chỉ tính trên dữ liệu của chính nó

### ✅ Các chức năng khác được xử lý ở:
1. **Service Layer** - Business logic phức tạp
2. **Controller Layer** - Nhận request và gọi Service
3. **Repository Layer** - Truy cập database

### ✅ Thiết kế của bạn:
- **Đã đúng** - Entity chỉ có các phương thức cần thiết
- **Đã đầy đủ** - Các chức năng khác được mô tả ở Service Layer (4.2.2.5, 4.2.2.6)
- **Phù hợp chuẩn** - Tuân thủ kiến trúc phân lớp

---

## 9. Tài liệu tham khảo

- **Layered Architecture Pattern**: Tách biệt các lớp với trách nhiệm riêng
- **Domain-Driven Design (DDD)**: Entity chỉ chứa dữ liệu và logic đơn giản
- **Spring Framework Best Practices**: Business logic ở Service, không ở Entity

---

**Kết luận:** Thiết kế của bạn đã đúng và đầy đủ. Entity chỉ cần các phương thức đó vì các chức năng khác được xử lý ở Service Layer, đúng với kiến trúc phân lớp chuẩn.
