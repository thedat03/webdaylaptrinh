package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.dto.CodeExerciseRequest;
import com.example.webdaylaptrinh.entity.CodeExercise;
import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.repository.CodeExerciseRepository;
import com.example.webdaylaptrinh.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service xử lý logic nghiệp vụ cho CodeExercise.
 * Cung cấp các phương thức CRUD và quản lý bài tập code.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CodeExerciseService {

    private final CodeExerciseRepository codeExerciseRepository;
    private final CourseRepository courseRepository;
    private final NotificationService notificationService;

    /**
     * Tạo bài tập code mới
     */
    @Transactional
    public CodeExercise createCodeExercise(CodeExerciseRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khóa học"));

        CodeExercise exercise = new CodeExercise();
        exercise.setCourse(course);
        exercise.setTitle(request.getTitle());
        exercise.setDescription(request.getDescription());
        exercise.setDocumentation(request.getDocumentation());
        exercise.setCodeSnippet(request.getCodeSnippet());
        exercise.setCodeLanguageId(request.getCodeLanguageId());
        exercise.setCodeTestCases(request.getCodeTestCases());
        exercise.setPosition(request.getPosition() != null ? request.getPosition() : 0);
        exercise.setEstimatedMinutes(request.getEstimatedMinutes());

        CodeExercise savedExercise = codeExerciseRepository.save(exercise);
        
        // Thông báo cho tất cả học viên đã đăng ký khóa học
        try {
            notificationService.notifyNewCodeExercise(course, savedExercise.getTitle());
        } catch (Exception e) {
            log.error("Error sending notification for new code exercise", e);
            // Không throw exception để không ảnh hưởng đến việc tạo bài tập
        }
        
        return savedExercise;
    }

    /**
     * Cập nhật bài tập code
     */
    @Transactional
    public CodeExercise updateCodeExercise(UUID exerciseId, CodeExerciseRequest request) {
        CodeExercise exercise = codeExerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài tập code"));

        exercise.setTitle(request.getTitle());
        exercise.setDescription(request.getDescription());
        exercise.setDocumentation(request.getDocumentation());
        exercise.setCodeSnippet(request.getCodeSnippet());
        exercise.setCodeLanguageId(request.getCodeLanguageId());
        exercise.setCodeTestCases(request.getCodeTestCases());
        if (request.getPosition() != null) {
            exercise.setPosition(request.getPosition());
        }
        if (request.getEstimatedMinutes() != null) {
            exercise.setEstimatedMinutes(request.getEstimatedMinutes());
        }

        CodeExercise savedExercise = codeExerciseRepository.save(exercise);
        Course course = exercise.getCourse();
        
        // Thông báo cho tất cả học viên đã đăng ký khóa học
        try {
            notificationService.notifyCodeExerciseUpdate(course, savedExercise.getTitle());
        } catch (Exception e) {
            log.error("Error sending notification for code exercise update", e);
            // Không throw exception để không ảnh hưởng đến việc cập nhật bài tập
        }
        
        return savedExercise;
    }

    /**
     * Lấy bài tập code theo ID
     */
    public CodeExercise getCodeExerciseById(UUID exerciseId) {
        return codeExerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài tập code"));
    }

    /**
     * Lấy tất cả bài tập code của một khóa học
     */
    public List<CodeExercise> getCodeExercisesByCourseId(UUID courseId) {
        return codeExerciseRepository.findByCourseIdOrderByPosition(courseId);
    }

    /**
     * Xóa bài tập code
     */
    @Transactional
    public void deleteCodeExercise(UUID exerciseId) {
        CodeExercise exercise = codeExerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài tập code"));
        
        Course course = exercise.getCourse();
        String exerciseTitle = exercise.getTitle();
        
        // Xóa bài tập
        codeExerciseRepository.deleteById(exerciseId);
        
        // Thông báo cho tất cả học viên đã đăng ký khóa học
        try {
            notificationService.notifyCodeExerciseDelete(course, exerciseTitle);
        } catch (Exception e) {
            log.error("Error sending notification for code exercise delete", e);
            // Không throw exception để không ảnh hưởng đến việc xóa bài tập
        }
    }
}
