package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.Progress;
import com.example.webdaylaptrinh.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface ProgressRepository extends JpaRepository<Progress, UUID> {

    Progress findByUserAndCourse(User user, Course course);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Progress p WHERE p.course.course_id = :courseId")
    void deleteByCourseId(@Param("courseId") UUID courseId);
}