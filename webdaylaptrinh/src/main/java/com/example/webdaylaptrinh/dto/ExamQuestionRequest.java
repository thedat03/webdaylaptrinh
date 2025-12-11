package com.example.webdaylaptrinh.dto;

import com.example.webdaylaptrinh.enums.QuestionType;
import lombok.Data;

@Data
public class ExamQuestionRequest {
    private QuestionType type;
    private String prompt;
    private String option1;
    private String option2;
    private String option3;
    private String option4;
    private String answer;
    private Integer languageId;
    private String starterCode;
    private String testCases; // JSON array of CodeTestCase
    private Double maxScore;
}

