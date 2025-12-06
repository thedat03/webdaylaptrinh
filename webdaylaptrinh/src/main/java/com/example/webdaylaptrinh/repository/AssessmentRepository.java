package com.example.webdaylaptrinh.repository;

import java.util.List;
import java.util.UUID;

import com.example.webdaylaptrinh.entity.Assessment;
import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AssessmentRepository extends JpaRepository<Assessment, UUID> {

    List<Assessment> findByUserAndCourse(User user, Course course);

    List<Assessment> findByUser(User user);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Assessment a WHERE a.course.course_id = :courseId")
    void deleteByCourseId(@Param("courseId") UUID courseId);
}
