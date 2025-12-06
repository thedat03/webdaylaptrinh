package com.example.webdaylaptrinh.dto;

import lombok.Data;

import java.util.List;

@Data
public class CodeRunResponse {
    private boolean overallPassed;
    private String message;
    private List<TestCaseResult> results;
    private String error; // Error message if execution failed
}


