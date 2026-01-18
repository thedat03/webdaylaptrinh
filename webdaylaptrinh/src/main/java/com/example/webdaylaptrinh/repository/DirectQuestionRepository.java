package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.DirectQuestion;
import com.example.webdaylaptrinh.entity.DirectQuestion.DirectQuestionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DirectQuestionRepository extends JpaRepository<DirectQuestion, UUID> {
    
    // Lấy tất cả câu hỏi của học viên
    @Query("SELECT dq FROM DirectQuestion dq WHERE dq.student.id = :studentId ORDER BY dq.createdAt DESC")
    List<DirectQuestion> findByStudentId(@Param("studentId") UUID studentId);
    
    // Lấy tất cả câu hỏi được phân công cho TA
    @Query("SELECT dq FROM DirectQuestion dq WHERE dq.ta.id = :taId ORDER BY dq.createdAt DESC")
    List<DirectQuestion> findByTaId(@Param("taId") UUID taId);
    
    // Lấy câu hỏi đang chờ (chưa có TA)
    @Query("SELECT dq FROM DirectQuestion dq WHERE dq.status = :status ORDER BY dq.createdAt ASC")
    List<DirectQuestion> findByStatus(@Param("status") DirectQuestionStatus status);
    
    // Lấy câu hỏi theo khóa học
    @Query("SELECT dq FROM DirectQuestion dq WHERE dq.course.course_id = :courseId ORDER BY dq.createdAt DESC")
    List<DirectQuestion> findByCourseId(@Param("courseId") UUID courseId);
    
    // Lấy câu hỏi theo bài học
    @Query("SELECT dq FROM DirectQuestion dq WHERE dq.lesson.lesson_id = :lessonId ORDER BY dq.createdAt DESC")
    List<DirectQuestion> findByLessonId(@Param("lessonId") UUID lessonId);
}
