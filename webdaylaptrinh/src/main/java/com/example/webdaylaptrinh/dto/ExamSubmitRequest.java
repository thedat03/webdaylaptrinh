package com.example.webdaylaptrinh.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ExamSubmitRequest {
    private List<AnswerPayload> answers;

    @Data
    public static class AnswerPayload {
        private UUID questionId;
        private String selectedOption;
        private String codeAnswer;
    }
}

