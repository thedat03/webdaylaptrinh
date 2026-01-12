package com.example.webdaylaptrinh.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LearningStatisticsDTO {
    // Thống kê tổng quan
    private int totalCourses;
    private int totalLessons;
    private int completedLessons;
    private double averageProgress;
    
    // Thống kê thảo luận
    private DiscussionStats discussionStats;
    
    // Thống kê hoạt động theo thời gian (heatmap data)
    private Map<String, Integer> activityHeatmap; // Format: "YYYY-MM-DD" -> count
    
    // Danh sách khóa học đã tham gia với chi tiết
    private List<CourseProgressDTO> enrolledCourses;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DiscussionStats {
        private int totalTopics; // Số discussion topics
        private int totalComments; // Số comments đã viết
        private int totalRatings; // Số đánh giá đã cho
        private int totalLikes; // Số lượt thích (nếu có trong tương lai)
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CourseProgressDTO {
        private String courseId;
        private String courseName;
        private String courseImage;
        private int totalLessons;
        private int completedLessons;
        private double progressPercentage;
        private int lessonsStudied; // Số bài đã học
    }
}

