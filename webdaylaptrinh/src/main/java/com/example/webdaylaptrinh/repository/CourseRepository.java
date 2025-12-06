package com.example.webdaylaptrinh.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.enums.CourseStatus;

import java.util.List;
import java.util.UUID;


public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findByStatus(CourseStatus status);
}
