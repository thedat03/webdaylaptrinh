package com.example.webdaylaptrinh.dto;

import com.example.webdaylaptrinh.entity.Course;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponse {
    private UUID id;
    
    @JsonProperty("courseId")
    private UUID courseId;
    
    @JsonProperty("courseName")
    private String courseName;
    
    private Integer price;
    private String instructor;
    private String description;
    
    @JsonProperty("pLink")
    private String pLink;
    
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;
}

