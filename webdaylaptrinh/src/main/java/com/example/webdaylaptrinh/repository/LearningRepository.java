package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.Learning;
import com.example.webdaylaptrinh.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface LearningRepository extends JpaRepository<Learning, UUID> {

    Learning findByUserAndCourse(User user, Course course);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Learning l WHERE l.course.course_id = :courseId")
    void deleteByCourseId(@Param("courseId") UUID courseId);

    @Query("SELECT l FROM Learning l WHERE l.course.course_id = :courseId")
    List<Learning> findByCourse_CourseId(@Param("courseId") UUID courseId);
    
    @Query("SELECT COUNT(l) FROM Learning l WHERE l.course = :course")
    long countByCourse(@Param("course") Course course);
}