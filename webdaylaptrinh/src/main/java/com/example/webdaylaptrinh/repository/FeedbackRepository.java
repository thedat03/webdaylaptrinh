package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Feedback f WHERE f.course.course_id = :courseId")
    void deleteByCourseId(@Param("courseId") UUID courseId);
}