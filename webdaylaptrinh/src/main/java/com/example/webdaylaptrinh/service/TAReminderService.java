package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.entity.*;
import com.example.webdaylaptrinh.entity.TAReminder.ReminderType;
import com.example.webdaylaptrinh.entity.TAReminder.ReminderStatus;
import com.example.webdaylaptrinh.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TAReminderService {

    private final TAReminderRepository reminderRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final TACourseAssignmentRepository taCourseAssignmentRepository;
    private final NotificationService notificationService;
    private final MessageService messageService;

    /**
     * TA gửi nhắc nhở cho học viên
     */
    @Transactional
    public TAReminder sendReminder(UUID taId, UUID studentId, String message, ReminderType type, UUID courseId, UUID lessonId) {
        User ta = userRepository.findById(taId)
                .orElseThrow(() -> new RuntimeException("TA not found"));
        
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Course course = null;
        if (courseId != null) {
            course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));
        }

        Lesson lesson = null;
        if (lessonId != null) {
            lesson = lessonRepository.findById(lessonId)
                    .orElseThrow(() -> new RuntimeException("Lesson not found"));
        }

        TAReminder.TAReminderBuilder builder = TAReminder.builder()
                .ta(ta)
                .student(student)
                .message(message)
                .type(type)
                .status(ReminderStatus.SENT);

        if (course != null) {
            builder.course(course);
        }

        if (lesson != null) {
            builder.lesson(lesson);
        }

        TAReminder reminder = reminderRepository.save(builder.build());

        try {
            // Tạo tin nhắn cho học viên trong phần chat
            String messageContent = message;
            if (course != null) {
                messageContent = String.format("📌 Nhắc nhở về khóa học \"%s\":\n\n%s", 
                        course.getCourse_name(), message);
            } else {
                messageContent = "📌 Nhắc nhở từ trợ giảng:\n\n" + message;
            }
            
            try {
                messageService.createMessage(taId, studentId, messageContent);
                log.info("Created message for student {} from TA {} about reminder {}", studentId, taId, reminder.getId());
            } catch (Exception e) {
                log.error("Error creating message for reminder {}: {}", reminder.getId(), e.getMessage());
                // Vẫn tiếp tục tạo notification ngay cả khi không thể tạo message
            }

            // Tạo thông báo cho học viên
            String notificationTitle = "Nhắc nhở từ trợ giảng";
            String notificationContent = message;
            if (course != null) {
                notificationContent = String.format("Trợ giảng đã gửi nhắc nhở về khóa học \"%s\":\n\n%s", 
                        course.getCourse_name(), message);
            }
            
            notificationService.createNotification(
                    studentId,
                    notificationTitle,
                    notificationContent,
                    "TA_REMINDER",
                    reminder.getId(),
                    "TA_REMINDER"
            );

            log.info("Created notification for student {} about reminder {}", studentId, reminder.getId());

            // Tạo thông báo xác nhận cho TA
            String confirmationTitle = "Đã gửi nhắc nhở thành công";
            String confirmationContent = String.format(
                    "Bạn đã gửi nhắc nhở cho học viên %s (%s).\n\nNội dung nhắc nhở:\n%s",
                    student.getUsername(),
                    student.getEmail(),
                    message
            );
            
            if (course != null) {
                confirmationContent += String.format("\n\nKhóa học: %s", course.getCourse_name());
            }
            
            if (lesson != null) {
                confirmationContent += String.format("\nBài học: %s", lesson.getTitle());
            }

            notificationService.createNotification(
                    taId,
                    confirmationTitle,
                    confirmationContent,
                    "TA_REMINDER_CONFIRMATION",
                    reminder.getId(),
                    "TA_REMINDER"
            );

            log.info("Created confirmation notification for TA {} about reminder {}", taId, reminder.getId());
        } catch (Exception e) {
            log.error("Error creating notification or message for reminder {}", reminder.getId(), e);
            // Không throw exception để không làm gián đoạn quá trình tạo reminder
        }

        return reminder;
    }

    /**
     * Lấy tất cả nhắc nhở mà TA đã gửi
     */
    public List<TAReminder> getTAReminders(UUID taId) {
        // Repository query đã JOIN FETCH course, student, lesson nên không cần force load
        return reminderRepository.findByTaId(taId);
    }

    /**
     * Lấy tất cả nhắc nhở của học viên
     */
    public List<TAReminder> getStudentReminders(UUID studentId) {
        return reminderRepository.findByStudentId(studentId);
    }

    /**
     * Đánh dấu nhắc nhở đã đọc
     */
    @Transactional
    public TAReminder markAsRead(UUID reminderId) {
        TAReminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));
        reminder.setStatus(ReminderStatus.READ);
        return reminderRepository.save(reminder);
    }

    /**
     * Tự động tạo nhắc nhở dựa trên rule
     * Ví dụ: 7 ngày không học, chưa hoàn thành bài X, chưa làm quiz
     */
    @Transactional
    public void createAutoReminders(UUID taId, UUID courseId) {
        // Kiểm tra TA có quyền truy cập khóa học
        taCourseAssignmentRepository.findByTaIdAndCourseId(taId, courseId)
                .orElseThrow(() -> new RuntimeException("TA doesn't have access to this course"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Lấy tất cả học viên đã đăng ký khóa học (cần implement Learning entity)
        // Giả sử có method để lấy học viên của khóa học
        // List<User> students = getEnrolledStudents(courseId);

        // Logic tạo nhắc nhở tự động:
        // 1. Kiểm tra học viên không học trong 7 ngày
        // 2. Kiểm tra học viên chưa hoàn thành bài học
        // 3. Kiểm tra học viên chưa làm quiz/đề thi

        // TODO: Implement logic chi tiết dựa trên LessonProgress và ExamSubmission
    }
}
