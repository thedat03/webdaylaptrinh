package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.entity.*;
import com.example.webdaylaptrinh.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Service để gửi thông báo cho TA khi học viên không hoạt động 7 ngày
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TAInactivityNotificationService {

    private final TAProgressService progressService;
    private final TACourseAssignmentRepository taCourseAssignmentRepository;
    private final NotificationService notificationService;
    private final LearningRepository learningRepository;
    private final LessonProgressRepository lessonProgressRepository;

    /**
     * Chạy mỗi ngày lúc 8:00 AM để kiểm tra học viên không hoạt động
     */
    @Scheduled(cron = "0 0 8 * * ?") // 8:00 AM mỗi ngày
    @Transactional
    public void checkInactiveStudents() {
        log.info("Bắt đầu kiểm tra học viên không hoạt động...");
        
        try {
            // Lấy tất cả TA
            List<TACourseAssignment> allAssignments = taCourseAssignmentRepository.findAll();
            
            // Nhóm theo TA
            java.util.Map<UUID, List<TACourseAssignment>> assignmentsByTA = allAssignments.stream()
                    .collect(java.util.stream.Collectors.groupingBy(assignment -> assignment.getTa().getId()));
            
            for (UUID taId : assignmentsByTA.keySet()) {
                List<TACourseAssignment> assignments = assignmentsByTA.get(taId);
                
                for (TACourseAssignment assignment : assignments) {
                    UUID courseId = assignment.getCourse().getCourse_id();
                    
                    try {
                        // Lấy danh sách học viên không hoạt động 7 ngày
                        List<TAProgressService.StudentProgressDTO> inactiveStudents = 
                                progressService.getStudentsNeedingReminder(taId, courseId, 7);
                        
                        for (TAProgressService.StudentProgressDTO student : inactiveStudents) {
                            // Kiểm tra xem đã có thông báo gần đây chưa (tránh spam)
                            if (shouldSendNotification(student, taId, courseId)) {
                                sendInactivityNotification(taId, student, assignment.getCourse());
                            }
                        }
                    } catch (Exception e) {
                        log.error("Lỗi khi kiểm tra học viên không hoạt động cho TA {} và khóa học {}", 
                                taId, courseId, e);
                    }
                }
            }
            
            log.info("Hoàn thành kiểm tra học viên không hoạt động");
        } catch (Exception e) {
            log.error("Lỗi khi chạy scheduled task kiểm tra học viên không hoạt động", e);
        }
    }

    /**
     * Kiểm tra xem có nên gửi thông báo không (tránh spam)
     */
    private boolean shouldSendNotification(TAProgressService.StudentProgressDTO student, UUID taId, UUID courseId) {
        // TODO: Có thể thêm logic kiểm tra xem đã gửi thông báo trong 7 ngày qua chưa
        // Hiện tại luôn gửi nếu học viên không hoạt động
        return true;
    }

    /**
     * Gửi thông báo cho TA về học viên không hoạt động
     */
    private void sendInactivityNotification(UUID taId, TAProgressService.StudentProgressDTO student, Course course) {
        try {
            String title = "Học viên không hoạt động 7 ngày";
            String content = String.format(
                    "Học viên %s (%s) đã không tham gia khóa học \"%s\" trong 7 ngày qua.\n\n" +
                    "Tiến độ hiện tại: %.1f%%\n" +
                    "Lần hoạt động cuối: %s",
                    student.getStudentName(),
                    student.getStudentEmail(),
                    course.getCourse_name(),
                    student.getProgressPercentage(),
                    student.getLastActivity() != null 
                            ? student.getLastActivity().toString() 
                            : "Chưa có"
            );

            notificationService.createNotification(
                    taId,
                    title,
                    content,
                    "STUDENT_INACTIVE",
                    student.getStudentId(),
                    "STUDENT"
            );

            log.info("Đã gửi thông báo cho TA {} về học viên {} không hoạt động", 
                    taId, student.getStudentName());
        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo cho TA {} về học viên {} không hoạt động", 
                    taId, student.getStudentName(), e);
        }
    }
}
