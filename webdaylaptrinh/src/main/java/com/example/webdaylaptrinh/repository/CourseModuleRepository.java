package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseModuleRepository extends JpaRepository<CourseModule, UUID> {
    List<CourseModule> findByCourseOrderByPositionAsc(Course course);
}


