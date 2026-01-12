package com.example.webdaylaptrinh.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.enums.CourseStatus;

import java.util.List;
import java.util.UUID;


public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findByStatus(CourseStatus status);
    
    @Query("SELECT DISTINCT c FROM Course c " +
           "LEFT JOIN c.category cat " +
           "WHERE c.status = :status " +
           "AND (LOWER(c.course_name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.instructor) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR (cat IS NOT NULL AND LOWER(cat.name) LIKE LOWER(CONCAT('%', :keyword, '%'))))")
    List<Course> searchCourses(@Param("status") CourseStatus status, @Param("keyword") String keyword);
}
