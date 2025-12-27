package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    
    // Lấy tất cả comment của một lesson (chỉ comment gốc, không phải reply)
    @Query("SELECT c FROM Comment c WHERE c.lesson.lesson_id = :lessonId AND c.parentComment IS NULL ORDER BY c.createdAt DESC")
    List<Comment> findByLesson_LessonIdAndParentCommentIsNullOrderByCreatedAtDesc(@Param("lessonId") UUID lessonId);
    
    // Lấy tất cả comment của một lesson (bao gồm cả reply)
    @Query("SELECT c FROM Comment c WHERE c.lesson.lesson_id = :lessonId ORDER BY c.createdAt ASC")
    List<Comment> findByLesson_LessonIdOrderByCreatedAtAsc(@Param("lessonId") UUID lessonId);
    
    // Lấy comment đã được duyệt
    @Query("SELECT c FROM Comment c WHERE c.lesson.lesson_id = :lessonId AND c.isApproved = true AND c.parentComment IS NULL ORDER BY c.createdAt DESC")
    List<Comment> findByLesson_LessonIdAndIsApprovedTrueAndParentCommentIsNullOrderByCreatedAtDesc(@Param("lessonId") UUID lessonId);
    
    // Lấy reply của một comment (tất cả reply, không cần filter isApproved)
    @Query("SELECT c FROM Comment c WHERE c.parentComment.commentId = :parentCommentId ORDER BY c.createdAt ASC")
    List<Comment> findByParentComment_CommentIdOrderByCreatedAtAsc(@Param("parentCommentId") UUID parentCommentId);
    
    // Lấy tất cả comment (cho admin quản lý)
    @Query("SELECT c FROM Comment c ORDER BY c.createdAt DESC")
    List<Comment> findAllComments();
    
    // Lấy tất cả comment chưa duyệt (nếu cần trong tương lai)
    @Query("SELECT c FROM Comment c WHERE c.isApproved = false ORDER BY c.createdAt DESC")
    List<Comment> findPendingComments();
    
    // Lấy comment theo user
    @Query("SELECT c FROM Comment c WHERE c.user.id = :userId ORDER BY c.createdAt DESC")
    List<Comment> findByUser_IdOrderByCreatedAtDesc(@Param("userId") UUID userId);
    
    // Đếm số comment của một lesson
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.lesson.lesson_id = :lessonId")
    long countByLesson_LessonId(@Param("lessonId") UUID lessonId);
    
    // Đếm số comment đã duyệt của một lesson
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.lesson.lesson_id = :lessonId AND c.isApproved = true")
    long countByLesson_LessonIdAndIsApprovedTrue(@Param("lessonId") UUID lessonId);
    
    // Lấy comment của một course (chỉ comment gốc, không phải reply)
    @Query("SELECT c FROM Comment c WHERE c.course.course_id = :courseId AND c.parentComment IS NULL AND c.isApproved = true ORDER BY c.createdAt DESC")
    List<Comment> findByCourse_CourseIdAndIsApprovedTrueAndParentCommentIsNullOrderByCreatedAtDesc(@Param("courseId") UUID courseId);
    
    // Lấy tất cả comment của một course (cho admin)
    @Query("SELECT c FROM Comment c WHERE c.course.course_id = :courseId AND c.parentComment IS NULL ORDER BY c.createdAt DESC")
    List<Comment> findByCourse_CourseIdAndParentCommentIsNullOrderByCreatedAtDesc(@Param("courseId") UUID courseId);
    
    // Đếm số comment đã duyệt của một course
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.course.course_id = :courseId AND c.isApproved = true")
    long countByCourse_CourseIdAndIsApprovedTrue(@Param("courseId") UUID courseId);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Comment c WHERE c.course.course_id = :courseId")
    void deleteByCourseId(@Param("courseId") UUID courseId);
    
    // Lấy featured comments (comments có rating từ tất cả courses, đã duyệt, không phải reply)
    @Query("SELECT c FROM Comment c WHERE c.course IS NOT NULL AND c.rating IS NOT NULL AND c.rating > 0 AND c.isApproved = true AND c.parentComment IS NULL ORDER BY c.createdAt DESC")
    List<Comment> findFeaturedComments();
}

