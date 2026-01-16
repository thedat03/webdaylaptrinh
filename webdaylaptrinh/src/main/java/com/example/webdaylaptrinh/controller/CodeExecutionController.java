package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.dto.CodeRunRequest;
import com.example.webdaylaptrinh.dto.CodeRunResponse;
import com.example.webdaylaptrinh.service.CodeExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/code")
@RequiredArgsConstructor
public class CodeExecutionController {

    private final CodeExecutionService codeExecutionService;

    @PostMapping("/lessons/{lessonId}/run")
    public CodeRunResponse runLessonCode(@PathVariable UUID lessonId, @RequestBody CodeRunRequest request) {
        return codeExecutionService.executeLessonCode(lessonId, request);
    }

    @PostMapping("/exercises/{exerciseId}/run")
    public CodeRunResponse runCodeExercise(@PathVariable UUID exerciseId, @RequestBody CodeRunRequest request) {
        return codeExecutionService.executeCodeExercise(exerciseId, request);
    }
}


