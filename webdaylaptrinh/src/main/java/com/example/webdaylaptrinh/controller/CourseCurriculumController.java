package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.dto.LessonRequest;
import com.example.webdaylaptrinh.dto.ModuleRequest;
import com.example.webdaylaptrinh.entity.CourseModule;
import com.example.webdaylaptrinh.entity.Lesson;
import com.example.webdaylaptrinh.service.CurriculumService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseCurriculumController {

    private final CurriculumService curriculumService;

    // Public fetch endpoints
    @GetMapping("/{courseId}/modules")
    public List<CourseModule> getModules(@PathVariable UUID courseId) {
        return curriculumService.getModules(courseId);
    }

    @GetMapping("/modules/{moduleId}/lessons")
    public List<Lesson> getLessons(@PathVariable UUID moduleId) {
        return curriculumService.getLessons(moduleId);
    }

    // Admin and Instructor management endpoints
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @PostMapping("/{courseId}/modules")
    public CourseModule addModule(@PathVariable UUID courseId, @RequestBody ModuleRequest request) {
        return curriculumService.addModule(courseId, request);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @PutMapping("/modules/{moduleId}")
    public CourseModule updateModule(@PathVariable UUID moduleId, @RequestBody ModuleRequest request) {
        return curriculumService.updateModule(moduleId, request);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @DeleteMapping("/modules/{moduleId}")
    public void deleteModule(@PathVariable UUID moduleId) {
        curriculumService.deleteModule(moduleId);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @PostMapping("/modules/{moduleId}/lessons")
    public Lesson addLesson(@PathVariable UUID moduleId, @RequestBody LessonRequest request) {
        return curriculumService.addLesson(moduleId, request);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @PutMapping("/lessons/{lessonId}")
    public Lesson updateLesson(@PathVariable UUID lessonId, @RequestBody LessonRequest request) {
        return curriculumService.updateLesson(lessonId, request);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @DeleteMapping("/lessons/{lessonId}")
    public void deleteLesson(@PathVariable UUID lessonId) {
        curriculumService.deleteLesson(lessonId);
    }
}


