package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.Notification;
import com.example.webdaylaptrinh.entity.Payment;
import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.enums.UserRole;
import com.example.webdaylaptrinh.entity.Learning;
import com.example.webdaylaptrinh.repository.CourseRepository;
import com.example.webdaylaptrinh.repository.LearningRepository;
import com.example.webdaylaptrinh.repository.NotificationRepository;
import com.example.webdaylaptrinh.repository.PaymentRepository;
import com.example.webdaylaptrinh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final PaymentRepository paymentRepository;
    private final LearningRepository learningRepository;

    /**
     * Tạo thông báo mới
     */
    @Transactional
    public Notification createNotification(UUID userId, String title, String content, String type, UUID relatedId, String relatedType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .content(content)
                .type(type)
                .relatedId(relatedId)
                .relatedType(relatedType)
                .isRead(false)
                .build();

        return notificationRepository.save(notification);
    }

    /**
     * Tạo thông báo khi thanh toán thành công
     */
    @Transactional
    public void notifyPaymentSuccess(Payment payment) {
        try {
            User student = payment.getUser();
            Course course = payment.getCourse();
            User instructor = course.getUser(); // Người tạo khóa học (instructor)

            // Thông báo cho học viên
            createNotification(
                    student.getId(),
                    "Thanh toán thành công!",
                    String.format("Bạn đã thanh toán thành công khóa học \"%s\". Bạn có thể bắt đầu học ngay bây giờ!", course.getCourse_name()),
                    "PAYMENT_SUCCESS",
                    course.getCourse_id(),
                    "COURSE"
            );

            // Thông báo cho giáo viên
            if (instructor != null && !instructor.getId().equals(student.getId())) {
                createNotification(
                        instructor.getId(),
                        "Học viên mới đã mua khóa học",
                        String.format("Học viên %s đã mua khóa học \"%s\" của bạn.", student.getUsername(), course.getCourse_name()),
                        "COURSE_ENROLLMENT",
                        course.getCourse_id(),
                        "COURSE"
                );
            }

            // Thông báo cho tất cả admin
            List<User> admins = userRepository.findAll().stream()
                    .filter(user -> user.getRole() == UserRole.ADMIN)
                    .toList();

            for (User admin : admins) {
                createNotification(
                        admin.getId(),
                        "Giao dịch thanh toán mới",
                        String.format("Học viên %s đã thanh toán thành công khóa học \"%s\" với số tiền %d VNĐ.",
                                student.getUsername(), course.getCourse_name(), payment.getAmount()),
                        "PAYMENT_SUCCESS",
                        payment.getId(),
                        "PAYMENT"
                );
            }

            log.info("Created payment success notifications for payment: {}", payment.getTxnRef());
        } catch (Exception e) {
            log.error("Error creating payment success notifications", e);
        }
    }

    /**
     * Lấy tất cả thông báo của user
     */
    public List<Notification> getUserNotifications(UUID userId) {
        return notificationRepository.findAllByUserId(userId);
    }

    /**
     * Đếm số thông báo chưa đọc
     */
    public Long getUnreadCount(UUID userId) {
        return notificationRepository.countUnreadNotifications(userId);
    }

    /**
     * Lấy thông báo chưa đọc
     */
    public List<Notification> getUnreadNotifications(UUID userId) {
        return notificationRepository.findUnreadNotifications(userId);
    }

    /**
     * Đánh dấu thông báo là đã đọc
     */
    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        notificationRepository.markAsRead(notificationId, userId);
    }

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsRead(userId);
    }

    /**
     * Xóa thông báo
     */
    @Transactional
    public void deleteNotification(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Thông báo không tồn tại"));

        // Chỉ người sở hữu mới có quyền xóa
        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa thông báo này");
        }

        notificationRepository.delete(notification);
    }

    /**
     * Thông báo cho tất cả học viên đã mua khóa học khi có bài học mới
     */
    @Transactional
    public void notifyNewLesson(Course course, String lessonTitle) {
        try {
            List<Learning> enrollments = learningRepository.findByCourse_CourseId(course.getCourse_id());
            
            for (Learning learning : enrollments) {
                createNotification(
                        learning.getUser().getId(),
                        "Bài học mới đã được thêm vào khóa học",
                        String.format("Giáo viên đã thêm bài học \"%s\" vào khóa học \"%s\". Hãy vào học ngay nhé!", 
                                lessonTitle, course.getCourse_name()),
                        "COURSE_UPDATE",
                        course.getCourse_id(),
                        "COURSE"
                );
            }
            
            log.info("Created new lesson notifications for course: {} with {} students", 
                    course.getCourse_name(), enrollments.size());
        } catch (Exception e) {
            log.error("Error creating new lesson notifications", e);
        }
    }

    /**
     * Thông báo cho tất cả học viên đã mua khóa học khi có cập nhật khóa học
     */
    @Transactional
    public void notifyCourseUpdate(Course course, String updateMessage) {
        try {
            List<Learning> enrollments = learningRepository.findByCourse_CourseId(course.getCourse_id());
            
            for (Learning learning : enrollments) {
                createNotification(
                        learning.getUser().getId(),
                        "Khóa học đã được cập nhật",
                        String.format("Khóa học \"%s\" đã được cập nhật: %s", 
                                course.getCourse_name(), updateMessage),
                        "COURSE_UPDATE",
                        course.getCourse_id(),
                        "COURSE"
                );
            }
            
            log.info("Created course update notifications for course: {} with {} students", 
                    course.getCourse_name(), enrollments.size());
        } catch (Exception e) {
            log.error("Error creating course update notifications", e);
        }
    }
}

