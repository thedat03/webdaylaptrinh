package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.entity.*;
import com.example.webdaylaptrinh.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TAProgressService {

    private final LessonProgressRepository lessonProgressRepository;
    private final TACourseAssignmentRepository taCourseAssignmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final LearningRepository learningRepository;
    private final ExamSubmissionRepository examSubmissionRepository;

    /**
     * Lấy tiến độ học của tất cả học viên trong khóa học mà TA được phép truy cập
     */
    public List<StudentProgressDTO> getStudentsProgressByCourse(UUID taId, UUID courseId) {
        // Kiểm tra TA có quyền truy cập khóa học
        taCourseAssignmentRepository.findByTaIdAndCourseId(taId, courseId)
                .orElseThrow(() -> new RuntimeException("TA doesn't have access to this course"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Lấy tất cả học viên đã đăng ký khóa học
        List<Learning> enrollments = learningRepository.findByCourse_CourseId(courseId);
        
        List<StudentProgressDTO> progressList = new ArrayList<>();
        
        for (Learning enrollment : enrollments) {
            User student = enrollment.getUser();
            StudentProgressDTO progress = getStudentProgress(student.getId(), courseId);
            progressList.add(progress);
        }

        return progressList;
    }

    /**
     * Tính plannedDays tự động dựa trên số bài học
     */
    private int calculatePlannedDays(int totalLessons) {
        if (totalLessons <= 30) {
            return 14;
        } else if (totalLessons <= 60) {
            return 28;
        } else if (totalLessons <= 120) {
            return 56;
        } else {
            return 84;
        }
    }

    /**
     * Lấy tiến độ học của một học viên cụ thể trong khóa học
     */
    public StudentProgressDTO getStudentProgress(UUID studentId, UUID courseId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Lấy enrollment để có enrolledAt
        Learning enrollment = learningRepository.findByUserAndCourse(student, course);
        LocalDateTime enrolledAt = enrollment != null && enrollment.getEnrolledAt() != null 
                ? enrollment.getEnrolledAt() 
                : LocalDateTime.now(); // Fallback nếu chưa có enrolledAt

        // Lấy tất cả lesson progress của học viên trong khóa học
        List<LessonProgress> lessonProgresses = lessonProgressRepository.findByUserIdAndCourseId(studentId, courseId);

        // Tính tổng số bài học trong khóa học
        int totalLessons = 0;
        if (course.getModules() != null) {
            for (CourseModule module : course.getModules()) {
                if (module.getLessons() != null) {
                    totalLessons += module.getLessons().size();
                }
            }
        }

        // Đếm số bài đã hoàn thành
        long completedLessons = lessonProgresses.stream()
                .filter(LessonProgress::getIsCompleted)
                .count();

        // Tính phần trăm hoàn thành
        double progressPercentage = totalLessons > 0 ? (completedLessons * 100.0) / totalLessons : 0.0;
        progressPercentage = Math.min(100.0, Math.max(0.0, progressPercentage));

        // Lấy lần hoạt động gần nhất (từ lesson progress có báo cáo)
        LocalDateTime lastActivity = lessonProgresses.stream()
                .map(LessonProgress::getLastAccessedAt)
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(null);

        // Tính plannedDays (ưu tiên từ course, nếu null thì tính tự động)
        int plannedDays = course.getPlannedDays() != null 
                ? course.getPlannedDays() 
                : calculatePlannedDays(totalLessons);

        // Tính elapsedDays (số ngày từ khi enroll)
        long elapsedDays = java.time.temporal.ChronoUnit.DAYS.between(enrolledAt, LocalDateTime.now());
        elapsedDays = Math.max(0, elapsedDays); // Đảm bảo không âm

        // Tính expected progress
        double expectedProgress = Math.min(100.0, (elapsedDays * 100.0) / plannedDays);

        // Tính gap (chênh lệch giữa tiến độ thực tế và kỳ vọng)
        double gap = progressPercentage - expectedProgress;

        // Phân loại tiến độ
        String progressStatus = "CHUA_BAT_DAU"; // Mặc định
        if (lastActivity != null) {
            // Có hoạt động
            if (elapsedDays <= 2) {
                // Ngoại lệ: học viên mới enroll <= 2 ngày
                if (progressPercentage == 0) {
                    progressStatus = "CHUA_BAT_DAU";
                } else {
                    progressStatus = "DANG_HOC";
                }
            } else {
                // Đánh giá dựa trên gap
                if (gap >= 10.0) {
                    progressStatus = "TOT";
                } else if (gap >= -10.0) {
                    progressStatus = "ON";
                } else {
                    progressStatus = "THAP";
                }
                
                // Nguy cơ bỏ học
                if (gap < -25.0) {
                    progressStatus = "NGUY_CO_BO_HOC";
                }
            }
        }

        StudentProgressDTO dto = new StudentProgressDTO();
        dto.setStudentId(studentId);
        dto.setStudentName(student.getUsername());
        dto.setStudentEmail(student.getEmail());
        dto.setCourseId(courseId);
        dto.setCourseName(course.getCourse_name());
        dto.setTotalLessons(totalLessons);
        dto.setCompletedLessons((int) completedLessons);
        dto.setProgressPercentage(progressPercentage);
        dto.setLastActivity(lastActivity);
        dto.setLessonsStudied(lessonProgresses.size());
        dto.setEnrolledAt(enrolledAt);
        dto.setPlannedDays(plannedDays);
        dto.setElapsedDays((int) elapsedDays);
        dto.setExpectedProgress(expectedProgress);
        dto.setGap(gap);
        dto.setProgressStatus(progressStatus);

        // Chi tiết bài học đã học/chưa học
        Map<String, Boolean> lessonStatus = new HashMap<>();
        if (course.getModules() != null) {
            for (CourseModule module : course.getModules()) {
                if (module.getLessons() != null) {
                    for (Lesson lesson : module.getLessons()) {
                        boolean isCompleted = lessonProgresses.stream()
                                .anyMatch(lp -> lp.getLesson().getLesson_id().equals(lesson.getLesson_id()) 
                                        && lp.getIsCompleted());
                        lessonStatus.put(lesson.getLesson_id().toString(), isCompleted);
                    }
                }
            }
        }
        dto.setLessonStatus(lessonStatus);

        return dto;
    }

    /**
     * Lấy danh sách khóa học được phân công cho TA
     */
    public List<Course> getAssignedCourses(UUID taId) {
        List<TACourseAssignment> assignments = taCourseAssignmentRepository.findByTaId(taId);
        return assignments.stream()
                .map(TACourseAssignment::getCourse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách học viên cần nhắc nhở (không học trong X ngày)
     */
    public List<StudentProgressDTO> getStudentsNeedingReminder(UUID taId, UUID courseId, int daysInactive) {
        List<StudentProgressDTO> allProgress = getStudentsProgressByCourse(taId, courseId);
        LocalDateTime threshold = LocalDateTime.now().minusDays(daysInactive);

        return allProgress.stream()
                .filter(progress -> {
                    if (progress.getLastActivity() == null) {
                        return true; // Chưa có hoạt động nào
                    }
                    return progress.getLastActivity().isBefore(threshold);
                })
                .collect(Collectors.toList());
    }

    /**
     * DTO cho tiến độ học viên
     */
    public static class StudentProgressDTO {
        private UUID studentId;
        private String studentName;
        private String studentEmail;
        private UUID courseId;
        private String courseName;
        private int totalLessons;
        private int completedLessons;
        private int lessonsStudied;
        private double progressPercentage;
        private LocalDateTime lastActivity;
        private Map<String, Boolean> lessonStatus; // lessonId -> isCompleted
        
        // Các field mới cho đánh giá tiến độ theo thời gian
        private LocalDateTime enrolledAt;
        private int plannedDays;
        private int elapsedDays;
        private double expectedProgress;
        private double gap; // progressPercentage - expectedProgress
        private String progressStatus; // CHUA_BAT_DAU, TOT, ON, THAP, NGUY_CO_BO_HOC, DANG_HOC

        // Getters and Setters
        public UUID getStudentId() { return studentId; }
        public void setStudentId(UUID studentId) { this.studentId = studentId; }
        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
        public String getStudentEmail() { return studentEmail; }
        public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
        public UUID getCourseId() { return courseId; }
        public void setCourseId(UUID courseId) { this.courseId = courseId; }
        public String getCourseName() { return courseName; }
        public void setCourseName(String courseName) { this.courseName = courseName; }
        public int getTotalLessons() { return totalLessons; }
        public void setTotalLessons(int totalLessons) { this.totalLessons = totalLessons; }
        public int getCompletedLessons() { return completedLessons; }
        public void setCompletedLessons(int completedLessons) { this.completedLessons = completedLessons; }
        public int getLessonsStudied() { return lessonsStudied; }
        public void setLessonsStudied(int lessonsStudied) { this.lessonsStudied = lessonsStudied; }
        public double getProgressPercentage() { return progressPercentage; }
        public void setProgressPercentage(double progressPercentage) { this.progressPercentage = progressPercentage; }
        public LocalDateTime getLastActivity() { return lastActivity; }
        public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }
        public Map<String, Boolean> getLessonStatus() { return lessonStatus; }
        public void setLessonStatus(Map<String, Boolean> lessonStatus) { this.lessonStatus = lessonStatus; }
        public LocalDateTime getEnrolledAt() { return enrolledAt; }
        public void setEnrolledAt(LocalDateTime enrolledAt) { this.enrolledAt = enrolledAt; }
        public int getPlannedDays() { return plannedDays; }
        public void setPlannedDays(int plannedDays) { this.plannedDays = plannedDays; }
        public int getElapsedDays() { return elapsedDays; }
        public void setElapsedDays(int elapsedDays) { this.elapsedDays = elapsedDays; }
        public double getExpectedProgress() { return expectedProgress; }
        public void setExpectedProgress(double expectedProgress) { this.expectedProgress = expectedProgress; }
        public double getGap() { return gap; }
        public void setGap(double gap) { this.gap = gap; }
        public String getProgressStatus() { return progressStatus; }
        public void setProgressStatus(String progressStatus) { this.progressStatus = progressStatus; }
    }
}
