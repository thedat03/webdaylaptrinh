package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.dto.LessonRequest;
import com.example.webdaylaptrinh.dto.ModuleRequest;
import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.CourseModule;
import com.example.webdaylaptrinh.entity.Lesson;
import com.example.webdaylaptrinh.repository.CommentRepository;
import com.example.webdaylaptrinh.repository.CourseModuleRepository;
import com.example.webdaylaptrinh.repository.CourseRepository;
import com.example.webdaylaptrinh.repository.DirectQuestionRepository;
import com.example.webdaylaptrinh.repository.LessonProgressRepository;
import com.example.webdaylaptrinh.repository.LessonRepository;
import com.example.webdaylaptrinh.repository.TAReminderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CurriculumService {

    private final CourseRepository courseRepository;
    private final CourseModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final CommentRepository commentRepository;
    private final TAReminderRepository taReminderRepository;
    private final DirectQuestionRepository directQuestionRepository;
    private final NotificationService notificationService;

    public List<CourseModule> getModules(UUID courseId) {
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) return List.of();
        return moduleRepository.findByCourseOrderByPositionAsc(course);
    }

    public CourseModule addModule(UUID courseId, ModuleRequest request) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        CourseModule module = new CourseModule();
        module.setCourse(course);
        module.setTitle(request.getTitle());
        module.setPosition(request.getPosition() == null ? 0 : request.getPosition());
        return moduleRepository.save(module);
    }

    public CourseModule updateModule(UUID moduleId, ModuleRequest request) {
        CourseModule module = moduleRepository.findById(moduleId).orElseThrow();
        if (request.getTitle() != null) module.setTitle(request.getTitle());
        if (request.getPosition() != null) module.setPosition(request.getPosition());
        return moduleRepository.save(module);
    }

    public void deleteModule(UUID moduleId) {
        moduleRepository.deleteById(moduleId);
    }

    public List<Lesson> getLessons(UUID moduleId) {
        CourseModule module = moduleRepository.findById(moduleId).orElse(null);
        if (module == null) return List.of();
        return lessonRepository.findByModuleOrderByPositionAsc(module);
    }

    @Transactional
    public Lesson addLesson(UUID moduleId, LessonRequest request) {
        CourseModule module = moduleRepository.findById(moduleId).orElseThrow();
        Course course = module.getCourse();
        
        Lesson lesson = new Lesson();
        lesson.setModule(module);
        lesson.setTitle(request.getTitle());
        lesson.setType(request.getType());
        lesson.setContentUrl(request.getContentUrl());
        lesson.setCodeSnippet(request.getCodeSnippet());
        lesson.setDescription(request.getDescription());
        lesson.setQuizData(request.getQuizData());
        lesson.setPosition(request.getPosition() == null ? 0 : request.getPosition());
        lesson.setDurationMinutes(request.getDurationMinutes());
        lesson.setCodeLanguageId(request.getCodeLanguageId());
        lesson.setCodeTestCases(request.getCodeTestCases());
        Lesson savedLesson = lessonRepository.save(lesson);
        
        // Thông báo cho tất cả học viên đã mua khóa học
        if (course != null) {
            notificationService.notifyNewLesson(course, request.getTitle());
        }
        
        return savedLesson;
    }

    @Transactional
    public Lesson updateLesson(UUID lessonId, LessonRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow();
        CourseModule module = lesson.getModule();
        Course course = module != null ? module.getCourse() : null;
        
        boolean titleChanged = request.getTitle() != null && !request.getTitle().equals(lesson.getTitle());
        String oldTitle = lesson.getTitle();
        
        if (request.getTitle() != null) lesson.setTitle(request.getTitle());
        if (request.getType() != null) lesson.setType(request.getType());
        if (request.getContentUrl() != null) lesson.setContentUrl(request.getContentUrl());
        if (request.getCodeSnippet() != null) lesson.setCodeSnippet(request.getCodeSnippet());
        if (request.getDescription() != null) lesson.setDescription(request.getDescription());
        if (request.getQuizData() != null) lesson.setQuizData(request.getQuizData());
        if (request.getPosition() != null) lesson.setPosition(request.getPosition());
        // Always update durationMinutes if provided (including 0)
        if (request.getDurationMinutes() != null) {
            lesson.setDurationMinutes(request.getDurationMinutes());
        }
        if (request.getCodeLanguageId() != null) lesson.setCodeLanguageId(request.getCodeLanguageId());
        if (request.getCodeTestCases() != null) lesson.setCodeTestCases(request.getCodeTestCases());
        Lesson savedLesson = lessonRepository.save(lesson);
        
        // Thông báo cho học viên nếu có thay đổi quan trọng
        if (course != null) {
            String updateMessage = titleChanged 
                ? String.format("Bài học \"%s\" đã được cập nhật thành \"%s\"", oldTitle, request.getTitle())
                : "Nội dung bài học đã được cập nhật";
            notificationService.notifyCourseUpdate(course, updateMessage);
        }
        
        return savedLesson;
    }

    @Transactional
    public void deleteLesson(UUID lessonId) {
        // Kiểm tra lesson có tồn tại không
        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null) {
            return; // Lesson không tồn tại, không cần xóa
        }
        
        // Xóa tất cả các bản ghi liên quan đến lesson trước
        // 1. Xóa LessonProgress (nullable = false, phải xóa)
        lessonProgressRepository.deleteByLessonId(lessonId);
        
        // 2. Xóa Comment liên quan đến lesson
        commentRepository.deleteByLessonId(lessonId);
        
        // 3. Set null cho lesson trong TAReminder (nullable = true)
        taReminderRepository.setLessonNullByLessonId(lessonId);
        
        // 4. Set null cho lesson trong DirectQuestion (nullable = true)
        directQuestionRepository.setLessonNullByLessonId(lessonId);
        
        // Cuối cùng mới xóa lesson
        lessonRepository.deleteById(lessonId);
    }
}


