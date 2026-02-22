package com.example.webdaylaptrinh.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InstructorRevenueDto {
    private long totalRevenue;
    private long totalCoursesSold;
    private long totalPayments;
}
