package com.example.webdaylaptrinh.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private Long totalUsers;
    private Long totalCourses;
    private Long totalEnrollments;
    private Long totalPayments;
    private Long totalRevenue;
    private Long pendingCourses;
    private Long activePromotions;
    private Long totalComments;
    
    // Recent activity
    private Long newUsersToday;
    private Long newUsersThisWeek;
    private Long newUsersThisMonth;
    private Long newCoursesThisMonth;
    private Long newPaymentsToday;
    
    // Revenue breakdown
    private Long revenueToday;
    private Long revenueThisWeek;
    private Long revenueThisMonth;
    private Long revenueThisYear;
    
    // Payment status counts
    private Long successfulPayments;
    private Long pendingPayments;
    private Long failedPayments;
    
    // Course status counts
    private Long approvedCourses;
    private Long rejectedCourses;
}

