package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.dto.LessonProgressRequest;
import com.example.webdaylaptrinh.service.LessonProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/lesson-progress")
@RequiredArgsConstructor
public class LessonProgressController {

    private final LessonProgressService lessonProgressService;

    @PostMapping("/complete")
    public ResponseEntity<String> markLessonCompleted(@RequestBody LessonProgressRequest request) {
        return lessonProgressService.markLessonCompleted(request);
    }

    @PutMapping("/access")
    public ResponseEntity<String> updateLessonAccess(@RequestBody LessonProgressRequest request) {
        return lessonProgressService.updateLessonAccess(request);
    }

    @GetMapping("/check/{userId}/{lessonId}")
    public ResponseEntity<Boolean> isLessonCompleted(
            @PathVariable UUID userId,
            @PathVariable UUID lessonId) {
        Boolean isCompleted = lessonProgressService.isLessonCompleted(userId, lessonId);
        return ResponseEntity.ok(isCompleted);
    }

    @GetMapping("/course/{userId}/{courseId}")
    public ResponseEntity<?> getLessonsProgressByCourse(
            @PathVariable UUID userId,
            @PathVariable UUID courseId) {
        return ResponseEntity.ok(lessonProgressService.getLessonsProgressByCourse(userId, courseId));
    }
}

