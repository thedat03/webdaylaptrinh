package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.dto.LearningPathDTO;
import com.example.webdaylaptrinh.service.LearningPathService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/learning-path")
@RequiredArgsConstructor
public class LearningPathController {

    private final LearningPathService learningPathService;

    @GetMapping("/{userId}")
    public ResponseEntity<LearningPathDTO> getLearningPath(@PathVariable UUID userId) {
        try {
            LearningPathDTO path = learningPathService.getLearningPath(userId);
            return ResponseEntity.ok(path);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

