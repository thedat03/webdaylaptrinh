package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.dto.LearningPathDTO;
import com.example.webdaylaptrinh.entity.*;
import com.example.webdaylaptrinh.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LearningPathService {

    private final LearningRepository learningRepository;
    private final ProgressRepository progressRepository;
    private final CourseRepository courseRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final LessonProgressRepository lessonProgressRepository;

    public LearningPathDTO getLearningPath(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Lấy tất cả khóa học đã đăng ký
        List<Learning> enrollments = learningRepository.findAll().stream()
                .filter(l -> l.getUser().getId().equals(userId))
                .collect(Collectors.toList());

        List<Course> enrolledCourses = enrollments.stream()
                .map(Learning::getCourse)
                .sorted(Comparator.comparing(Course::getCourse_name))
                .collect(Collectors.toList());

        List<LearningPathDTO.PathStep> steps = new ArrayList<>();
        int currentStepIndex = -1;
        double overallProgress = 0.0;

        for (int i = 0; i < enrolledCourses.size(); i++) {
            Course course = enrolledCourses.get(i);
            
            // Đếm tổng số lessons
            List<CourseModule> modules = courseModuleRepository.findByCourseOrderByPositionAsc(course);
            int totalLessons = 0;
            for (CourseModule module : modules) {
                List<Lesson> lessons = lessonRepository.findByModuleOrderByPositionAsc(module);
                totalLessons += lessons.size();
            }

            // Đếm số bài học đã hoàn thành từ LessonProgress
            int completedLessons = 0;
            double courseProgress = 0.0;
            if (totalLessons > 0) {
                long completedCount = lessonProgressRepository.countCompletedLessonsByUserIdAndCourseId(userId, course.getCourse_id());
                completedLessons = (int) completedCount;
                courseProgress = (completedLessons * 100.0) / totalLessons;
                courseProgress = Math.min(100.0, Math.max(0.0, courseProgress));
            }

            boolean isCompleted = courseProgress >= 100.0;
            boolean isCurrent = !isCompleted && (currentStepIndex == -1);

            if (isCurrent) {
                currentStepIndex = i;
            }

            overallProgress += courseProgress;

            LearningPathDTO.PathStep step = new LearningPathDTO.PathStep();
            step.setCourseId(course.getCourse_id());
            step.setCourseName(course.getCourse_name());
            step.setCourseImage(course.getP_link());
            step.setDescription(course.getDescription() != null && course.getDescription().length() > 100 
                    ? course.getDescription().substring(0, 100) + "..." 
                    : course.getDescription());
            step.setStepOrder(i + 1);
            step.setCompleted(isCompleted);
            step.setCurrent(isCurrent);
            step.setProgress(courseProgress);
            step.setTotalLessons(totalLessons);
            step.setCompletedLessons(completedLessons);

            steps.add(step);
        }

        if (currentStepIndex == -1 && !steps.isEmpty()) {
            // Nếu tất cả đã hoàn thành, đánh dấu khóa học cuối cùng là current
            if (steps.stream().allMatch(LearningPathDTO.PathStep::isCompleted)) {
                currentStepIndex = steps.size() - 1;
                if (currentStepIndex >= 0) {
                    steps.get(currentStepIndex).setCurrent(true);
                }
            } else {
                // Tìm khóa học có progress thấp nhất chưa hoàn thành
                Optional<LearningPathDTO.PathStep> nextStep = steps.stream()
                        .filter(s -> !s.isCompleted())
                        .min(Comparator.comparingDouble(LearningPathDTO.PathStep::getProgress));
                if (nextStep.isPresent()) {
                    currentStepIndex = steps.indexOf(nextStep.get());
                    steps.get(currentStepIndex).setCurrent(true);
                }
            }
        }

        overallProgress = enrolledCourses.isEmpty() ? 0.0 : overallProgress / enrolledCourses.size();

        LearningPathDTO path = new LearningPathDTO();
        path.setUserId(userId);
        path.setUserName(user.getUsername());
        path.setSteps(steps);
        path.setCurrentStepIndex(currentStepIndex);
        path.setOverallProgress(overallProgress);

        return path;
    }
}

