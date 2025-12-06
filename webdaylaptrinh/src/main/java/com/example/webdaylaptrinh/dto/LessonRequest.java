package com.example.webdaylaptrinh.dto;

import com.example.webdaylaptrinh.enums.LessonType;
import lombok.Data;

@Data
public class LessonRequest {
    private String title;
    private LessonType type;
    private String contentUrl;
    private String codeSnippet;
    private String description;
    private String quizData;
    private Integer position;
    private Integer codeLanguageId;
    private String codeTestCases;
}


