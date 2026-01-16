package com.example.webdaylaptrinh.dto;

import lombok.Data;

import java.util.UUID;

/**
 * DTO cho request tạo/cập nhật bài tập code
 */
@Data
public class CodeExerciseRequest {
    private String title;
    private String description;
    private String documentation;
    private String codeSnippet;
    private Integer codeLanguageId;
    private String codeTestCases; // JSON string
    private Integer position;
    private Integer estimatedMinutes;
    private UUID courseId;
}
