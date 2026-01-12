package com.example.webdaylaptrinh.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopCourseDTO {
    private UUID courseId;
    private String courseName;
    private String instructor;
    private Long enrollmentCount;
    private Long revenue;
    private Double rating;
    private Integer price;
}

