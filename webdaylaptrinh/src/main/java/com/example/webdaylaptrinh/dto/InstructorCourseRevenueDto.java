package com.example.webdaylaptrinh.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class InstructorCourseRevenueDto {
    private UUID courseId;
    private String courseName;
    private long price;
    private long soldCount;
    private long totalRevenue;
    private LocalDateTime lastSoldAt;
}
