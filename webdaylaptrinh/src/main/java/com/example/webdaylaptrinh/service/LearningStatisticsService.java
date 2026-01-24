package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.dto.LearningStatisticsDTO;
import com.example.webdaylaptrinh.entity.*;
import com.example.webdaylaptrinh.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LearningStatisticsService {

    private final LearningRepository learningRepository;
    private final ProgressRepository progressRepository;
    private final CommentRepository commentRepository;
    private final CourseRepository courseRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final LessonProgressRepository lessonProgressRepository;

    public LearningStatisticsDTO getLearningStatistics(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Lấy tất cả khóa học đã đăng ký
        List<Learning> enrollments = learningRepository.findAll().stream()
                .filter(l -> l.getUser().getId().equals(userId))
                .collect(Collectors.toList());

        List<Course> enrolledCourses = enrollments.stream()
                .map(Learning::getCourse)
                .collect(Collectors.toList());

        // Tính tổng số bài học
        int totalLessons = 0;
        int completedLessons = 0;
        List<LearningStatisticsDTO.CourseProgressDTO> courseProgressList = new ArrayList<>();

        for (Course course : enrolledCourses) {
            // Lấy modules và lessons
            List<CourseModule> modules = courseModuleRepository.findByCourseOrderByPositionAsc(course);
            int courseTotalLessons = 0;
            int courseCompletedLessons = 0;

            for (CourseModule module : modules) {
                List<Lesson> lessons = lessonRepository.findByModuleOrderByPositionAsc(module);
                courseTotalLessons += lessons.size();
            }

            // Đếm số bài học đã hoàn thành từ LessonProgress
            if (courseTotalLessons > 0) {
                long completedCount = lessonProgressRepository.countCompletedLessonsByUserIdAndCourseId(userId, course.getCourse_id());
                courseCompletedLessons = (int) completedCount;
            }

            // Tính progress dựa trên số bài đã hoàn thành
            double courseProgress = 0.0;
            if (courseTotalLessons > 0) {
                courseProgress = (courseCompletedLessons * 100.0) / courseTotalLessons;
                courseProgress = Math.min(100.0, Math.max(0.0, courseProgress));
            }

            totalLessons += courseTotalLessons;
            completedLessons += courseCompletedLessons;

            LearningStatisticsDTO.CourseProgressDTO courseProgressDTO = 
                new LearningStatisticsDTO.CourseProgressDTO();
            courseProgressDTO.setCourseId(course.getCourse_id().toString());
            courseProgressDTO.setCourseName(course.getCourse_name());
            courseProgressDTO.setCourseImage(course.getP_link());
            courseProgressDTO.setTotalLessons(courseTotalLessons);
            courseProgressDTO.setCompletedLessons(courseCompletedLessons);
            courseProgressDTO.setProgressPercentage(courseProgress);
            courseProgressDTO.setLessonsStudied(courseCompletedLessons);

            courseProgressList.add(courseProgressDTO);
        }

        // Tính progress trung bình
        double averageProgress = enrolledCourses.isEmpty() ? 0.0 :
                courseProgressList.stream()
                        .mapToDouble(LearningStatisticsDTO.CourseProgressDTO::getProgressPercentage)
                        .average()
                        .orElse(0.0);

        // Thống kê thảo luận
        List<Comment> userComments = commentRepository.findByUser_IdOrderByCreatedAtDesc(userId);

        // Đếm số comments
        int totalComments = userComments.size();

        // Đếm số ratings (comments có rating)
        int totalRatings = (int) userComments.stream()
                .filter(c -> c.getRating() != null && c.getRating() > 0)
                .count();

        // Tổng số likes (tạm thời = 0, có thể mở rộng sau)
        int totalLikes = 0;

        LearningStatisticsDTO.DiscussionStats discussionStats = 
            new LearningStatisticsDTO.DiscussionStats();
        discussionStats.setTotalTopics(0); // Không còn Discussion, set = 0
        discussionStats.setTotalComments(totalComments);
        discussionStats.setTotalRatings(totalRatings);
        discussionStats.setTotalLikes(totalLikes);

        // Tạo activity heatmap (30 ngày gần nhất)
        Map<String, Integer> activityHeatmap = generateActivityHeatmap(userId, userComments);

        // Tạo DTO response
        LearningStatisticsDTO statistics = new LearningStatisticsDTO();
        statistics.setTotalCourses(enrolledCourses.size());
        statistics.setTotalLessons(totalLessons);
        statistics.setCompletedLessons(completedLessons);
        statistics.setAverageProgress(averageProgress);
        statistics.setDiscussionStats(discussionStats);
        statistics.setActivityHeatmap(activityHeatmap);
        statistics.setEnrolledCourses(courseProgressList);

        return statistics;
    }

    private Map<String, Integer> generateActivityHeatmap(UUID userId, 
                                                          List<Comment> comments) {
        Map<String, Integer> heatmap = new HashMap<>();
        
        // Khởi tạo 30 ngày gần nhất với giá trị 0
        LocalDate today = LocalDate.now();
        for (int i = 29; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            String dateKey = date.format(DateTimeFormatter.ISO_LOCAL_DATE);
            heatmap.put(dateKey, 0);
        }

        // Đếm hoạt động từ comments
        for (Comment comment : comments) {
            if (comment.getCreatedAt() != null) {
                LocalDate commentDate = comment.getCreatedAt().toLocalDate();
                LocalDate thirtyDaysAgo = today.minusDays(29);
                
                if (!commentDate.isBefore(thirtyDaysAgo) && !commentDate.isAfter(today)) {
                    String dateKey = commentDate.format(DateTimeFormatter.ISO_LOCAL_DATE);
                    heatmap.put(dateKey, heatmap.getOrDefault(dateKey, 0) + 1);
                }
            }
        }

        return heatmap;
    }
}

