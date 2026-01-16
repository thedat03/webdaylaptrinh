package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.dto.CodeExerciseRequest;
import com.example.webdaylaptrinh.entity.CodeExercise;
import com.example.webdaylaptrinh.service.CodeExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller quản lý các API endpoint cho CodeExercise.
 * Cung cấp các chức năng CRUD và quản lý bài tập code.
 */
@RestController
@RequestMapping("/api/code-exercises")
@RequiredArgsConstructor
public class CodeExerciseController {

    private final CodeExerciseService codeExerciseService;

    /**
     * Tạo bài tập code mới
     */
    @PostMapping
    public ResponseEntity<CodeExercise> createCodeExercise(@RequestBody CodeExerciseRequest request) {
        try {
            CodeExercise exercise = codeExerciseService.createCodeExercise(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(exercise);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Cập nhật bài tập code
     */
    @PutMapping("/{exerciseId}")
    public ResponseEntity<CodeExercise> updateCodeExercise(
            @PathVariable UUID exerciseId,
            @RequestBody CodeExerciseRequest request) {
        try {
            CodeExercise exercise = codeExerciseService.updateCodeExercise(exerciseId, request);
            return ResponseEntity.ok(exercise);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Lấy bài tập code theo ID
     */
    @GetMapping("/{exerciseId}")
    public ResponseEntity<CodeExercise> getCodeExerciseById(@PathVariable UUID exerciseId) {
        try {
            CodeExercise exercise = codeExerciseService.getCodeExerciseById(exerciseId);
            return ResponseEntity.ok(exercise);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Lấy tất cả bài tập code của một khóa học
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CodeExercise>> getCodeExercisesByCourseId(@PathVariable UUID courseId) {
        List<CodeExercise> exercises = codeExerciseService.getCodeExercisesByCourseId(courseId);
        return ResponseEntity.ok(exercises);
    }

    /**
     * Xóa bài tập code
     */
    @DeleteMapping("/{exerciseId}")
    public ResponseEntity<Void> deleteCodeExercise(@PathVariable UUID exerciseId) {
        try {
            codeExerciseService.deleteCodeExercise(exerciseId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
