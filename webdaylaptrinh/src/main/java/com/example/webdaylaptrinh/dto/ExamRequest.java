package com.example.webdaylaptrinh.dto;

import lombok.Data;

@Data
public class ExamRequest {
    private String title;
    private String description;
    private boolean published;
}

