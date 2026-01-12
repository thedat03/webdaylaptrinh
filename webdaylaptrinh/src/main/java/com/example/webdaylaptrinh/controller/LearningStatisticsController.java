package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.dto.LearningStatisticsDTO;
import com.example.webdaylaptrinh.service.LearningStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/learning-statistics")
@RequiredArgsConstructor
public class LearningStatisticsController {

    private final LearningStatisticsService learningStatisticsService;

    @GetMapping("/{userId}")
    public ResponseEntity<LearningStatisticsDTO> getLearningStatistics(@PathVariable UUID userId) {
        try {
            LearningStatisticsDTO statistics = learningStatisticsService.getLearningStatistics(userId);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

