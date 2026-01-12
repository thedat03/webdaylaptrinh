package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.dto.LessonProgressRequest;
import com.example.webdaylaptrinh.entity.Lesson;
import com.example.webdaylaptrinh.entity.LessonProgress;
import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.repository.LessonProgressRepository;
import com.example.webdaylaptrinh.repository.LessonRepository;
import com.example.webdaylaptrinh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LessonProgressService {

    private final LessonProgressRepository lessonProgressRepository;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final ProgressService progressService;

    public ResponseEntity<String> markLessonCompleted(LessonProgressRequest request) {
        UUID userId = request.getUserId();
        UUID lessonId = request.getLessonId();

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Lesson not found");
        }

        Optional<LessonProgress> existingProgress = lessonProgressRepository.findByUserAndLesson(user, lesson);
        
        LessonProgress lessonProgress;
        if (existingProgress.isPresent()) {
            lessonProgress = existingProgress.get();
            if (!lessonProgress.getIsCompleted()) {
                lessonProgress.setIsCompleted(true);
                lessonProgress.setCompletedAt(LocalDateTime.now());
                lessonProgressRepository.save(lessonProgress);
                
                // Cập nhật tiến độ khóa học
                updateCourseProgress(userId, lesson);
            }
        } else {
            lessonProgress = new LessonProgress();
            lessonProgress.setUser(user);
            lessonProgress.setLesson(lesson);
            lessonProgress.setIsCompleted(true);
            lessonProgress.setCompletedAt(LocalDateTime.now());
            lessonProgress.setLastAccessedAt(LocalDateTime.now());
            lessonProgressRepository.save(lessonProgress);
            
            // Cập nhật tiến độ khóa học
            updateCourseProgress(userId, lesson);
        }

        return ResponseEntity.ok("Lesson marked as completed");
    }

    public ResponseEntity<String> updateLessonAccess(LessonProgressRequest request) {
        UUID userId = request.getUserId();
        UUID lessonId = request.getLessonId();

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Lesson not found");
        }

        Optional<LessonProgress> existingProgress = lessonProgressRepository.findByUserAndLesson(user, lesson);
        
        LessonProgress lessonProgress;
        if (existingProgress.isPresent()) {
            lessonProgress = existingProgress.get();
            lessonProgress.setLastAccessedAt(LocalDateTime.now());
        } else {
            lessonProgress = new LessonProgress();
            lessonProgress.setUser(user);
            lessonProgress.setLesson(lesson);
            lessonProgress.setIsCompleted(false);
            lessonProgress.setLastAccessedAt(LocalDateTime.now());
        }
        lessonProgressRepository.save(lessonProgress);

        return ResponseEntity.ok("Lesson access updated");
    }

    public Boolean isLessonCompleted(UUID userId, UUID lessonId) {
        Optional<LessonProgress> progress = lessonProgressRepository.findByUserIdAndLessonId(userId, lessonId);
        return progress.map(LessonProgress::getIsCompleted).orElse(false);
    }

    public List<LessonProgress> getCompletedLessonsByUser(UUID userId) {
        return lessonProgressRepository.findCompletedLessonsByUserId(userId);
    }

    public List<LessonProgress> getLessonsProgressByCourse(UUID userId, UUID courseId) {
        return lessonProgressRepository.findByUserIdAndCourseId(userId, courseId);
    }

    @Transactional
    private void updateCourseProgress(UUID userId, Lesson lesson) {
        // Lấy course từ lesson
        if (lesson.getModule() != null && lesson.getModule().getCourse() != null) {
            UUID courseId = lesson.getModule().getCourse().getCourse_id();
            
            // Đếm số bài học đã hoàn thành trong khóa học này
            long completedCount = lessonProgressRepository.countCompletedLessonsByUserIdAndCourseId(userId, courseId);
            
            // Lấy tổng số bài học trong khóa học (cần tính từ modules)
            // Tạm thời dùng cách đơn giản: cập nhật progress dựa trên tỷ lệ
            // Có thể cải thiện sau bằng cách tính chính xác tổng số lessons
            
            // Cập nhật Progress entity (course level)
            // Tính toán playedTime dựa trên số bài đã hoàn thành
            // Giả sử mỗi bài học = 1 đơn vị, duration = tổng số bài học
            // Có thể cải thiện logic này sau
        }
    }
}

