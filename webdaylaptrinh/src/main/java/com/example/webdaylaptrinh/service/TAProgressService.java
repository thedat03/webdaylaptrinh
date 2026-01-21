package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.entity.*;
import com.example.webdaylaptrinh.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Comparator;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TAProgressService {

    private final LessonProgressRepository lessonProgressRepository;
    private final TACourseAssignmentRepository taCourseAssignmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final LearningRepository learningRepository;
    private final ExamSubmissionRepository examSubmissionRepository;
    private final ExamRepository examRepository;
    private final PaymentRepository paymentRepository;

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
     * Tính thống kê học tập trong 7 ngày qua
     */
    private WeeklyStudyStatsDTO calculateWeeklyStudyStats(List<LessonProgress> lessonProgresses, Course course) {
        WeeklyStudyStatsDTO stats = new WeeklyStudyStatsDTO();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        
        // Map để lưu tổng số phút học mỗi ngày (key: ngày, value: tổng phút)
        Map<String, Integer> dailyMinutes = new HashMap<>();
        
        // Khởi tạo 7 ngày với 0 phút
        for (int i = 0; i < 7; i++) {
            LocalDateTime day = sevenDaysAgo.plusDays(i);
            String dayKey = day.toLocalDate().toString();
            dailyMinutes.put(dayKey, 0);
        }
        
        // Tính tổng phút học từ lesson progress trong 7 ngày qua
        for (LessonProgress progress : lessonProgresses) {
            if (progress.getLastAccessedAt() != null) {
                LocalDateTime accessDate = progress.getLastAccessedAt();
                // Kiểm tra nếu trong khoảng 7 ngày qua (từ sevenDaysAgo đến now)
                if (!accessDate.isBefore(sevenDaysAgo) && !accessDate.isAfter(now)) {
                    String dayKey = accessDate.toLocalDate().toString();
                    
                    // Tính số phút từ watchedSeconds
                    int minutes = 0;
                    if (progress.getWatchedSeconds() != null && progress.getWatchedSeconds() > 0) {
                        minutes = progress.getWatchedSeconds() / 60;
                    } else if (progress.getIsCompleted() != null && progress.getIsCompleted()) {
                        // Nếu đã hoàn thành nhưng không có watchedSeconds, dùng durationMinutes của lesson
                        if (progress.getLesson() != null && progress.getLesson().getDurationMinutes() != null) {
                            minutes = progress.getLesson().getDurationMinutes();
                        }
                    }
                    
                    // Cộng vào tổng phút của ngày đó
                    dailyMinutes.put(dayKey, dailyMinutes.getOrDefault(dayKey, 0) + minutes);
                }
            }
        }
        
        // Tạo danh sách DailyStudyDTO
        List<DailyStudyDTO> dailyStats = new ArrayList<>();
        int totalMinutes = 0;
        int goodDays = 0; // >= 30 phút
        int averageDays = 0; // 15-30 phút
        int poorDays = 0; // < 15 phút
        
        for (int i = 0; i < 7; i++) {
            LocalDateTime day = sevenDaysAgo.plusDays(i);
            String dayKey = day.toLocalDate().toString();
            int minutes = dailyMinutes.getOrDefault(dayKey, 0);
            totalMinutes += minutes;
            
            DailyStudyDTO daily = new DailyStudyDTO();
            daily.setDate(day.toLocalDate());
            daily.setMinutes(minutes);
            
            // Đánh giá từng ngày
            if (minutes >= 30) {
                daily.setRating("TOT");
                goodDays++;
            } else if (minutes >= 15) {
                daily.setRating("TRUNG_BINH");
                averageDays++;
            } else {
                daily.setRating("KEM");
                poorDays++;
            }
            
            dailyStats.add(daily);
        }
        
        // Tính trung bình phút/ngày
        double averageMinutesPerDay = totalMinutes / 7.0;
        
        // Đánh giá tổng thể
        String overallRating = "KEM";
        if (averageMinutesPerDay >= 30) {
            overallRating = "TOT";
        } else if (averageMinutesPerDay >= 15) {
            overallRating = "TRUNG_BINH";
        }
        
        stats.setDailyStats(dailyStats);
        stats.setTotalMinutes(totalMinutes);
        stats.setAverageMinutesPerDay(averageMinutesPerDay);
        stats.setGoodDays(goodDays);
        stats.setAverageDays(averageDays);
        stats.setPoorDays(poorDays);
        stats.setOverallRating(overallRating);
        
        return stats;
    }

    /**
     * Lấy tiến độ học của một học viên cụ thể trong khóa học
     */
    public StudentProgressDTO getStudentProgress(UUID studentId, UUID courseId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Lấy enrollment để có enrolledAt (ngày mua thành công khóa học)
        Learning enrollment = learningRepository.findByUserAndCourse(student, course);
        if (enrollment == null) {
            throw new RuntimeException("Student has not enrolled in this course");
        }
        LocalDateTime enrolledAt = enrollment.getEnrolledAt();
        if (enrolledAt == null) {
            // Nếu chưa có enrolledAt, tìm từ Payment thành công (status = PAID)
            List<Payment> successfulPayments = paymentRepository.findAllByUser(student).stream()
                    .filter(p -> p.getCourse().getCourse_id().equals(courseId) 
                            && p.getStatus() == com.example.webdaylaptrinh.enums.PaymentStatus.PAID)
                    .sorted((p1, p2) -> {
                        LocalDateTime date1 = p1.getPayDate() != null ? p1.getPayDate() : p1.getCreatedAt();
                        LocalDateTime date2 = p2.getPayDate() != null ? p2.getPayDate() : p2.getCreatedAt();
                        return date2.compareTo(date1); // Sắp xếp giảm dần
                    })
                    .collect(java.util.stream.Collectors.toList());
            
            if (!successfulPayments.isEmpty()) {
                // Lấy payment thành công đầu tiên (mới nhất)
                Payment latestPayment = successfulPayments.get(0);
                enrolledAt = latestPayment.getPayDate() != null 
                        ? latestPayment.getPayDate() 
                        : latestPayment.getCreatedAt();
            } else {
                // Nếu không có payment, dùng thời điểm hiện tại
                enrolledAt = LocalDateTime.now();
            }
            
            // Cập nhật enrolledAt vào enrollment
            enrollment.setEnrolledAt(enrolledAt);
            learningRepository.save(enrollment);
        }

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

        /**
         * PHÂN LOẠI TRẠNG THÁI MỚI:
         * - CHUA_BAT_DAU: Đã tham gia khóa học nhưng chưa học bài nào (progressPercentage == 0)
         * - DANG_HOC: Đã tham gia và trong 7 ngày có hoạt động
         * - DA_NGHI: Quá 7 ngày không có hoạt động (hiển thị số ngày nghỉ)
         */
        String progressStatus = "CHUA_BAT_DAU";
        Integer daysInactive = null;
        
        if (progressPercentage == 0) {
            // Chưa học bài nào
            progressStatus = "CHUA_BAT_DAU";
        } else if (lastActivity != null) {
            // Có hoạt động, kiểm tra số ngày từ lần hoạt động cuối
            long daysSinceLastActivity = java.time.temporal.ChronoUnit.DAYS.between(lastActivity, LocalDateTime.now());
            if (daysSinceLastActivity <= 7) {
                progressStatus = "DANG_HOC";
            } else {
                progressStatus = "DA_NGHI";
                daysInactive = (int) daysSinceLastActivity;
            }
        } else {
            // Có progress nhưng không có lastActivity (trường hợp đặc biệt)
            progressStatus = "DANG_HOC";
        }
        
        // Tính thống kê học tập trong 7 ngày qua
        WeeklyStudyStatsDTO weeklyStats = calculateWeeklyStudyStats(lessonProgresses, course);

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
        // lessonsStudied = số bài đã xem (có record trong lesson_progress, không nhất thiết phải hoàn thành)
        dto.setLessonsStudied(lessonProgresses.size());
        dto.setEnrolledAt(enrolledAt);
        dto.setProgressStatus(progressStatus);
        dto.setDaysInactive(daysInactive);
        dto.setWeeklyStudyStats(weeklyStats);

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
     * Lấy chi tiết hoạt động của học viên: video watch time, bài học đã hoàn thành, bài tập
     */
    public StudentActivityDetailDTO getStudentActivityDetails(UUID taId, UUID studentId, UUID courseId) {
        // Kiểm tra TA có quyền truy cập khóa học
        taCourseAssignmentRepository.findByTaIdAndCourseId(taId, courseId)
                .orElseThrow(() -> new RuntimeException("TA doesn't have access to this course"));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Lấy tất cả lesson progress của học viên trong khóa học
        List<LessonProgress> lessonProgresses = lessonProgressRepository.findByUserIdAndCourseId(studentId, courseId);

        // Tạo danh sách chi tiết bài học với video watch time
        List<LessonActivityDTO> lessonActivities = new ArrayList<>();
        if (course.getModules() != null) {
            for (CourseModule module : course.getModules()) {
                if (module.getLessons() != null) {
                    for (Lesson lesson : module.getLessons()) {
                        LessonActivityDTO activity = new LessonActivityDTO();
                        activity.setLessonId(lesson.getLesson_id());
                        activity.setLessonTitle(lesson.getTitle() != null ? lesson.getTitle() : "Không có tiêu đề");
                        activity.setLessonType(lesson.getType() != null ? lesson.getType().toString() : null);
                        activity.setModuleName(module.getTitle() != null ? module.getTitle() : "Không có tên module");
                        activity.setDurationMinutes(lesson.getDurationMinutes());
                        
                        // Tìm progress của bài học này
                        Optional<LessonProgress> progressOpt = lessonProgresses.stream()
                                .filter(lp -> lp.getLesson().getLesson_id().equals(lesson.getLesson_id()))
                                .findFirst();
                        
                        // Xác định loại bài học cần xử lý đặc biệt (MATERIAL, QUIZ, CODE)
                        boolean isSpecialType = lesson.getType() != null && 
                                (lesson.getType() == com.example.webdaylaptrinh.enums.LessonType.MATERIAL || 
                                 lesson.getType() == com.example.webdaylaptrinh.enums.LessonType.QUIZ || 
                                 lesson.getType() == com.example.webdaylaptrinh.enums.LessonType.CODE);
                        
                        if (progressOpt.isPresent()) {
                            LessonProgress progress = progressOpt.get();
                            boolean isCompleted = progress.getIsCompleted() != null ? progress.getIsCompleted() : false;
                            activity.setIsCompleted(isCompleted);
                            activity.setLastAccessedAt(progress.getLastAccessedAt());
                            activity.setCompletedAt(progress.getCompletedAt());
                            
                            // Xử lý đặc biệt cho MATERIAL, QUIZ, CODE
                            if (isSpecialType) {
                                if (isCompleted) {
                                    // Đã hoàn thành: 100% và thời gian = thời lượng
                                    Integer durationMinutes = lesson.getDurationMinutes();
                                    int totalSeconds = (durationMinutes != null && durationMinutes > 0) ? durationMinutes * 60 : 0;
                                    activity.setWatchedSeconds(totalSeconds);
                                    activity.setWatchedPercentage(100.0);
                                    
                                    // Format thời gian xem
                                    if (totalSeconds > 0) {
                                        int minutes = totalSeconds / 60;
                                        int seconds = totalSeconds % 60;
                                        activity.setWatchedTimeFormatted(String.format("%d:%02d", minutes, seconds));
                                    } else {
                                        activity.setWatchedTimeFormatted("0:00");
                                    }
                                } else {
                                    // Chưa hoàn thành: 0% và 0 giây
                                    activity.setWatchedSeconds(0);
                                    activity.setWatchedPercentage(0.0);
                                    activity.setWatchedTimeFormatted("0:00");
                                }
                            } else {
                                // Các loại bài học khác (VIDEO, HOMEWORK): giữ nguyên logic cũ
                                activity.setWatchedSeconds(progress.getWatchedSeconds() != null ? progress.getWatchedSeconds() : 0);
                                activity.setWatchedPercentage(progress.getWatchedPercentage() != null ? progress.getWatchedPercentage() : 0.0);
                                
                                // Tính thời gian xem dạng phút:giây
                                if (activity.getWatchedSeconds() > 0) {
                                    int minutes = activity.getWatchedSeconds() / 60;
                                    int seconds = activity.getWatchedSeconds() % 60;
                                    activity.setWatchedTimeFormatted(String.format("%d:%02d", minutes, seconds));
                                } else {
                                    activity.setWatchedTimeFormatted("0:00");
                                }
                            }
                        } else {
                            // Chưa có progress
                            activity.setIsCompleted(false);
                            
                            if (isSpecialType) {
                                // MATERIAL, QUIZ, CODE chưa hoàn thành: 0% và 0 giây
                                activity.setWatchedSeconds(0);
                                activity.setWatchedPercentage(0.0);
                                activity.setWatchedTimeFormatted("0:00");
                            } else {
                                // Các loại khác: giữ nguyên logic cũ
                                activity.setWatchedSeconds(0);
                                activity.setWatchedPercentage(0.0);
                                activity.setWatchedTimeFormatted("0:00");
                            }
                        }
                        
                        lessonActivities.add(activity);
                    }
                }
            }
        }

        // Lấy danh sách bài thi đã nộp
        List<ExamActivityDTO> examActivities = new ArrayList<>();
        List<Exam> exams = examRepository.findByCourseAndPublishedTrue(course);
        for (Exam exam : exams) {
            List<ExamSubmission> submissions = examSubmissionRepository.findByExamAndUser(exam, student);
            if (!submissions.isEmpty()) {
                // Lấy submission mới nhất (xử lý null values)
                ExamSubmission latestSubmission = submissions.stream()
                        .filter(s -> s.getSubmittedAt() != null)
                        .max(Comparator.comparing(ExamSubmission::getSubmittedAt))
                        .orElse(submissions.get(0)); // Nếu không có submission nào có submittedAt, lấy cái đầu tiên
                
                if (latestSubmission != null) {
                    ExamActivityDTO examActivity = new ExamActivityDTO();
                    examActivity.setExamId(exam.getId());
                    examActivity.setExamTitle(exam.getTitle() != null ? exam.getTitle() : "Không có tiêu đề");
                    examActivity.setTotalScore(latestSubmission.getTotalScore() != null ? latestSubmission.getTotalScore() : 0.0);
                    examActivity.setMaxScore(latestSubmission.getMaxScore() != null ? latestSubmission.getMaxScore() : 0.0);
                    examActivity.setPassed(latestSubmission.isPassed());
                    examActivity.setSubmittedAt(latestSubmission.getSubmittedAt() != null 
                            ? latestSubmission.getSubmittedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime()
                            : null);
                    examActivity.setSubmissionCount(submissions.size());
                    examActivities.add(examActivity);
                }
            }
        }

        StudentActivityDetailDTO detailDTO = new StudentActivityDetailDTO();
        detailDTO.setStudentId(studentId);
        detailDTO.setStudentName(student.getUsername());
        detailDTO.setStudentEmail(student.getEmail());
        detailDTO.setCourseId(courseId);
        detailDTO.setCourseName(course.getCourse_name());
        detailDTO.setLessonActivities(lessonActivities);
        detailDTO.setExamActivities(examActivities);
        detailDTO.setTotalLessons(lessonActivities.size());
        detailDTO.setCompletedLessons((int) lessonActivities.stream().filter(LessonActivityDTO::getIsCompleted).count());
        detailDTO.setTotalExams(examActivities.size());
        detailDTO.setCompletedExams(examActivities.size());

        return detailDTO;
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
        
        // Các field cho đánh giá tiến độ
        private LocalDateTime enrolledAt;
        private String progressStatus; // CHUA_BAT_DAU, DANG_HOC, DA_NGHI
        private Integer daysInactive; // Số ngày nghỉ (nếu status = DA_NGHI)
        private WeeklyStudyStatsDTO weeklyStudyStats; // Thống kê học tập 7 ngày qua

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
        public String getProgressStatus() { return progressStatus; }
        public void setProgressStatus(String progressStatus) { this.progressStatus = progressStatus; }
        public Integer getDaysInactive() { return daysInactive; }
        public void setDaysInactive(Integer daysInactive) { this.daysInactive = daysInactive; }
        public WeeklyStudyStatsDTO getWeeklyStudyStats() { return weeklyStudyStats; }
        public void setWeeklyStudyStats(WeeklyStudyStatsDTO weeklyStudyStats) { this.weeklyStudyStats = weeklyStudyStats; }
    }

    /**
     * DTO cho chi tiết hoạt động học viên
     */
    public static class StudentActivityDetailDTO {
        private UUID studentId;
        private String studentName;
        private String studentEmail;
        private UUID courseId;
        private String courseName;
        private List<LessonActivityDTO> lessonActivities;
        private List<ExamActivityDTO> examActivities;
        private int totalLessons;
        private int completedLessons;
        private int totalExams;
        private int completedExams;

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
        public List<LessonActivityDTO> getLessonActivities() { return lessonActivities; }
        public void setLessonActivities(List<LessonActivityDTO> lessonActivities) { this.lessonActivities = lessonActivities; }
        public List<ExamActivityDTO> getExamActivities() { return examActivities; }
        public void setExamActivities(List<ExamActivityDTO> examActivities) { this.examActivities = examActivities; }
        public int getTotalLessons() { return totalLessons; }
        public void setTotalLessons(int totalLessons) { this.totalLessons = totalLessons; }
        public int getCompletedLessons() { return completedLessons; }
        public void setCompletedLessons(int completedLessons) { this.completedLessons = completedLessons; }
        public int getTotalExams() { return totalExams; }
        public void setTotalExams(int totalExams) { this.totalExams = totalExams; }
        public int getCompletedExams() { return completedExams; }
        public void setCompletedExams(int completedExams) { this.completedExams = completedExams; }
    }

    /**
     * DTO cho hoạt động bài học (video watch time, completion status)
     */
    public static class LessonActivityDTO {
        private UUID lessonId;
        private String lessonTitle;
        private String lessonType;
        private String moduleName;
        private Integer durationMinutes;
        private Boolean isCompleted;
        private Integer watchedSeconds;
        private Double watchedPercentage;
        private String watchedTimeFormatted; // Format: "MM:SS"
        private LocalDateTime lastAccessedAt;
        private LocalDateTime completedAt;

        // Getters and Setters
        public UUID getLessonId() { return lessonId; }
        public void setLessonId(UUID lessonId) { this.lessonId = lessonId; }
        public String getLessonTitle() { return lessonTitle; }
        public void setLessonTitle(String lessonTitle) { this.lessonTitle = lessonTitle; }
        public String getLessonType() { return lessonType; }
        public void setLessonType(String lessonType) { this.lessonType = lessonType; }
        public String getModuleName() { return moduleName; }
        public void setModuleName(String moduleName) { this.moduleName = moduleName; }
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
        public Boolean getIsCompleted() { return isCompleted; }
        public void setIsCompleted(Boolean isCompleted) { this.isCompleted = isCompleted; }
        public Integer getWatchedSeconds() { return watchedSeconds; }
        public void setWatchedSeconds(Integer watchedSeconds) { this.watchedSeconds = watchedSeconds; }
        public Double getWatchedPercentage() { return watchedPercentage; }
        public void setWatchedPercentage(Double watchedPercentage) { this.watchedPercentage = watchedPercentage; }
        public String getWatchedTimeFormatted() { return watchedTimeFormatted; }
        public void setWatchedTimeFormatted(String watchedTimeFormatted) { this.watchedTimeFormatted = watchedTimeFormatted; }
        public LocalDateTime getLastAccessedAt() { return lastAccessedAt; }
        public void setLastAccessedAt(LocalDateTime lastAccessedAt) { this.lastAccessedAt = lastAccessedAt; }
        public LocalDateTime getCompletedAt() { return completedAt; }
        public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    }

    /**
     * DTO cho hoạt động bài thi
     */
    public static class ExamActivityDTO {
        private UUID examId;
        private String examTitle;
        private Double totalScore;
        private Double maxScore;
        private Boolean passed;
        private LocalDateTime submittedAt;
        private Integer submissionCount;

        // Getters and Setters
        public UUID getExamId() { return examId; }
        public void setExamId(UUID examId) { this.examId = examId; }
        public String getExamTitle() { return examTitle; }
        public void setExamTitle(String examTitle) { this.examTitle = examTitle; }
        public Double getTotalScore() { return totalScore; }
        public void setTotalScore(Double totalScore) { this.totalScore = totalScore; }
        public Double getMaxScore() { return maxScore; }
        public void setMaxScore(Double maxScore) { this.maxScore = maxScore; }
        public Boolean getPassed() { return passed; }
        public void setPassed(Boolean passed) { this.passed = passed; }
        public LocalDateTime getSubmittedAt() { return submittedAt; }
        public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
        public Integer getSubmissionCount() { return submissionCount; }
        public void setSubmissionCount(Integer submissionCount) { this.submissionCount = submissionCount; }
    }

    /**
     * DTO cho thống kê học tập trong 7 ngày qua
     */
    public static class WeeklyStudyStatsDTO {
        private List<DailyStudyDTO> dailyStats;
        private int totalMinutes;
        private double averageMinutesPerDay;
        private int goodDays; // >= 30 phút/ngày
        private int averageDays; // 15-30 phút/ngày
        private int poorDays; // < 15 phút/ngày
        private String overallRating; // TOT, TRUNG_BINH, KEM

        // Getters and Setters
        public List<DailyStudyDTO> getDailyStats() { return dailyStats; }
        public void setDailyStats(List<DailyStudyDTO> dailyStats) { this.dailyStats = dailyStats; }
        public int getTotalMinutes() { return totalMinutes; }
        public void setTotalMinutes(int totalMinutes) { this.totalMinutes = totalMinutes; }
        public double getAverageMinutesPerDay() { return averageMinutesPerDay; }
        public void setAverageMinutesPerDay(double averageMinutesPerDay) { this.averageMinutesPerDay = averageMinutesPerDay; }
        public int getGoodDays() { return goodDays; }
        public void setGoodDays(int goodDays) { this.goodDays = goodDays; }
        public int getAverageDays() { return averageDays; }
        public void setAverageDays(int averageDays) { this.averageDays = averageDays; }
        public int getPoorDays() { return poorDays; }
        public void setPoorDays(int poorDays) { this.poorDays = poorDays; }
        public String getOverallRating() { return overallRating; }
        public void setOverallRating(String overallRating) { this.overallRating = overallRating; }
    }

    /**
     * DTO cho thống kê học tập từng ngày
     */
    public static class DailyStudyDTO {
        private java.time.LocalDate date;
        private int minutes;
        private String rating; // TOT, TRUNG_BINH, KEM

        // Getters and Setters
        public java.time.LocalDate getDate() { return date; }
        public void setDate(java.time.LocalDate date) { this.date = date; }
        public int getMinutes() { return minutes; }
        public void setMinutes(int minutes) { this.minutes = minutes; }
        public String getRating() { return rating; }
        public void setRating(String rating) { this.rating = rating; }
    }
}
