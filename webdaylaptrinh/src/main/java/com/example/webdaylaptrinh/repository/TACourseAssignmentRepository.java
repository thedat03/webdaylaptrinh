package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.TACourseAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TACourseAssignmentRepository extends JpaRepository<TACourseAssignment, UUID> {
    
    // Lấy tất cả khóa học mà TA được phép truy cập
    @Query("SELECT ta FROM TACourseAssignment ta WHERE ta.ta.id = :taId")
    List<TACourseAssignment> findByTaId(@Param("taId") UUID taId);
    
    // Lấy tất cả TA được phép truy cập một khóa học
    @Query("SELECT ta FROM TACourseAssignment ta WHERE ta.course.course_id = :courseId")
    List<TACourseAssignment> findByCourse_CourseId(@Param("courseId") UUID courseId);
    
    // Alias method for convenience
    default List<TACourseAssignment> findByCourseId(UUID courseId) {
        return findByCourse_CourseId(courseId);
    }
    
    // Kiểm tra TA có được phép truy cập khóa học không
    @Query("SELECT ta FROM TACourseAssignment ta WHERE ta.ta.id = :taId AND ta.course.course_id = :courseId")
    Optional<TACourseAssignment> findByTaIdAndCourseId(@Param("taId") UUID taId, @Param("courseId") UUID courseId);
    
    // Xóa assignment
    @Modifying
    @Query("DELETE FROM TACourseAssignment ta WHERE ta.ta.id = :taId AND ta.course.course_id = :courseId")
    void deleteByTaIdAndCourseId(@Param("taId") UUID taId, @Param("courseId") UUID courseId);
}
