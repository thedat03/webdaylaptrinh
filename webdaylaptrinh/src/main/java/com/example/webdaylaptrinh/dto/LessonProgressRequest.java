package com.example.webdaylaptrinh.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LessonProgressRequest {
    private UUID userId;
    private UUID lessonId;
    private Boolean isCompleted;
}

