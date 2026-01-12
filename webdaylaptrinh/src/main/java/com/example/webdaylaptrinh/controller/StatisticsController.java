package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.dto.DashboardStatsDTO;
import com.example.webdaylaptrinh.dto.RevenueChartDTO;
import com.example.webdaylaptrinh.dto.TopCourseDTO;
import com.example.webdaylaptrinh.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {
    
    private final StatisticsService statisticsService;
    
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public DashboardStatsDTO getDashboardStats() {
        return statisticsService.getDashboardStats();
    }
    
    @GetMapping("/revenue-chart")
    @PreAuthorize("hasRole('ADMIN')")
    public RevenueChartDTO getRevenueChart(@RequestParam(defaultValue = "month") String period) {
        return statisticsService.getRevenueChart(period);
    }
    
    @GetMapping("/top-courses")
    @PreAuthorize("hasRole('ADMIN')")
    public List<TopCourseDTO> getTopCourses(@RequestParam(defaultValue = "10") int limit) {
        return statisticsService.getTopCourses(limit);
    }
}

