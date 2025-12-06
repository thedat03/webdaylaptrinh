package com.example.webdaylaptrinh.dto;

import lombok.Data;

@Data
public class TestCaseResult {
    private String name;
    private boolean passed;
    private String status;
    private String stdout;
    private String stderr;
    private String compileOutput;
    private String expectedOutput;
    private String input;
    private boolean hidden;
    private Double time;
    private Double memory;
}


