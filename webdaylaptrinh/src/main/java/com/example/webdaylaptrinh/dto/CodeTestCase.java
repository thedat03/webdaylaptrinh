package com.example.webdaylaptrinh.dto;

import lombok.Data;

@Data
public class CodeTestCase {
    private String name;
    private String stdin;
    private String expectedOutput;
    private boolean hidden;
}


