package com.example.webdaylaptrinh.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LearningPathDTO {
    private UUID userId;
    private String userName;
    private List<PathStep> steps;
    private int currentStepIndex;
    private double overallProgress;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PathStep {
        private UUID courseId;
        private String courseName;
        private String courseImage;
        private String description;
        private int stepOrder;
        private boolean isCompleted;
        private boolean isCurrent;
        private double progress;
        private int totalLessons;
        private int completedLessons;
    }
}

