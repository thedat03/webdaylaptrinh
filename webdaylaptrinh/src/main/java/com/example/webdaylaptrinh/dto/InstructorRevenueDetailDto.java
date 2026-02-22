package com.example.webdaylaptrinh.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class InstructorRevenueDetailDto {
    private long totalRevenue;
    private long totalCoursesSold;
    private long totalPayments;
    private List<InstructorCourseRevenueDto> courses;
    private List<InstructorRevenuePointDto> revenueByMonth;
}
