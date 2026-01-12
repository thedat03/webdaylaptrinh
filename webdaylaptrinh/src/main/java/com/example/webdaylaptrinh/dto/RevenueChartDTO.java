package com.example.webdaylaptrinh.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueChartDTO {
    private List<String> labels; // Dates
    private List<Long> revenues; // Revenue amounts
    private String period; // "day", "week", "month", "year"
}

