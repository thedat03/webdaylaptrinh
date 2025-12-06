package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.dto.LessonRequest;
import com.example.webdaylaptrinh.dto.ModuleRequest;
import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.CourseModule;
import com.example.webdaylaptrinh.entity.Lesson;
import com.example.webdaylaptrinh.repository.CourseModuleRepository;
import com.example.webdaylaptrinh.repository.CourseRepository;
import com.example.webdaylaptrinh.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CurriculumService {

    private final CourseRepository courseRepository;
    private final CourseModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;

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

    public Lesson addLesson(UUID moduleId, LessonRequest request) {
        CourseModule module = moduleRepository.findById(moduleId).orElseThrow();
        Lesson lesson = new Lesson();
        lesson.setModule(module);
        lesson.setTitle(request.getTitle());
        lesson.setType(request.getType());
        lesson.setContentUrl(request.getContentUrl());
        lesson.setCodeSnippet(request.getCodeSnippet());
        lesson.setDescription(request.getDescription());
        lesson.setQuizData(request.getQuizData());
        lesson.setPosition(request.getPosition() == null ? 0 : request.getPosition());
        lesson.setCodeLanguageId(request.getCodeLanguageId());
        lesson.setCodeTestCases(request.getCodeTestCases());
        return lessonRepository.save(lesson);
    }

    public Lesson updateLesson(UUID lessonId, LessonRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow();
        if (request.getTitle() != null) lesson.setTitle(request.getTitle());
        if (request.getType() != null) lesson.setType(request.getType());
        if (request.getContentUrl() != null) lesson.setContentUrl(request.getContentUrl());
        if (request.getCodeSnippet() != null) lesson.setCodeSnippet(request.getCodeSnippet());
        if (request.getDescription() != null) lesson.setDescription(request.getDescription());
        if (request.getQuizData() != null) lesson.setQuizData(request.getQuizData());
        if (request.getPosition() != null) lesson.setPosition(request.getPosition());
        if (request.getCodeLanguageId() != null) lesson.setCodeLanguageId(request.getCodeLanguageId());
        if (request.getCodeTestCases() != null) lesson.setCodeTestCases(request.getCodeTestCases());
        return lessonRepository.save(lesson);
    }

    public void deleteLesson(UUID lessonId) {
        lessonRepository.deleteById(lessonId);
    }
}


