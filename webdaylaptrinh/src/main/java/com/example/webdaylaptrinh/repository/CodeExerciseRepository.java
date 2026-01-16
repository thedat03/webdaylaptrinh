package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.CodeExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository cho CodeExercise entity.
 * Cung cấp các phương thức truy vấn cơ sở dữ liệu cho bài tập code.
 */
@Repository
public interface CodeExerciseRepository extends JpaRepository<CodeExercise, UUID> {

    /**
     * Tìm tất cả bài tập code của một khóa học, sắp xếp theo vị trí
     */
    @Query("SELECT e FROM CodeExercise e WHERE e.course.course_id = :courseId ORDER BY e.position ASC")
    List<CodeExercise> findByCourseIdOrderByPosition(@Param("courseId") UUID courseId);

    /**
     * Đếm số bài tập code trong một khóa học
     */
    @Query("SELECT COUNT(e) FROM CodeExercise e WHERE e.course.course_id = :courseId")
    long countByCourseId(@Param("courseId") UUID courseId);
}
