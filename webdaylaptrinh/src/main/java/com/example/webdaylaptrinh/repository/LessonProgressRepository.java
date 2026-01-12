package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.Lesson;
import com.example.webdaylaptrinh.entity.LessonProgress;
import com.example.webdaylaptrinh.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, UUID> {
    
    Optional<LessonProgress> findByUserAndLesson(User user, Lesson lesson);
    
    @Query("SELECT lp FROM LessonProgress lp WHERE lp.user.id = :userId AND lp.lesson.lesson_id = :lessonId")
    Optional<LessonProgress> findByUserIdAndLessonId(@Param("userId") UUID userId, @Param("lessonId") UUID lessonId);
    
    @Query("SELECT lp FROM LessonProgress lp WHERE lp.user.id = :userId AND lp.isCompleted = true")
    List<LessonProgress> findCompletedLessonsByUserId(@Param("userId") UUID userId);
    
    @Query("SELECT lp FROM LessonProgress lp WHERE lp.user.id = :userId AND lp.lesson.module.course.course_id = :courseId")
    List<LessonProgress> findByUserIdAndCourseId(@Param("userId") UUID userId, @Param("courseId") UUID courseId);
    
    @Query("SELECT COUNT(lp) FROM LessonProgress lp WHERE lp.user.id = :userId AND lp.lesson.module.course.course_id = :courseId AND lp.isCompleted = true")
    long countCompletedLessonsByUserIdAndCourseId(@Param("userId") UUID userId, @Param("courseId") UUID courseId);
}

