package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.entity.Comment;
import com.example.webdaylaptrinh.entity.CodeExercise;
import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.Lesson;
import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.repository.CodeExerciseRepository;
import com.example.webdaylaptrinh.repository.CommentRepository;
import com.example.webdaylaptrinh.repository.CourseRepository;
import com.example.webdaylaptrinh.repository.LessonRepository;
import com.example.webdaylaptrinh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final CodeExerciseRepository codeExerciseRepository;
    private final UserRepository userRepository;

    // Lấy tất cả comment đã duyệt của một lesson (chỉ comment gốc)
    public List<Comment> getApprovedCommentsByLesson(UUID lessonId) {
        return commentRepository.findByLesson_LessonIdAndIsApprovedTrueAndParentCommentIsNullOrderByCreatedAtDesc(lessonId);
    }

    // Lấy tất cả comment (bao gồm cả chưa duyệt) - cho admin
    public List<Comment> getAllCommentsByLesson(UUID lessonId) {
        return commentRepository.findByLesson_LessonIdAndParentCommentIsNullOrderByCreatedAtDesc(lessonId);
    }

    // Lấy tất cả comment đã duyệt của một course (chỉ comment gốc)
    public List<Comment> getApprovedCommentsByCourse(UUID courseId) {
        return commentRepository.findByCourse_CourseIdAndIsApprovedTrueAndParentCommentIsNullOrderByCreatedAtDesc(courseId);
    }

    // Lấy tất cả comment của một course (cho admin)
    public List<Comment> getAllCommentsByCourse(UUID courseId) {
        return commentRepository.findByCourse_CourseIdAndParentCommentIsNullOrderByCreatedAtDesc(courseId);
    }

    // Lấy tất cả comment đã duyệt của một exercise (chỉ comment gốc)
    public List<Comment> getApprovedCommentsByExercise(UUID exerciseId) {
        return commentRepository.findByExercise_ExerciseIdAndIsApprovedTrueAndParentCommentIsNullOrderByCreatedAtDesc(exerciseId);
    }

    // Lấy tất cả comment của một exercise (cho admin)
    public List<Comment> getAllCommentsByExercise(UUID exerciseId) {
        return commentRepository.findByExercise_ExerciseIdAndParentCommentIsNullOrderByCreatedAtDesc(exerciseId);
    }

    // Lấy reply của một comment
    public List<Comment> getRepliesByCommentId(UUID commentId) {
        return commentRepository.findByParentComment_CommentIdOrderByCreatedAtAsc(commentId);
    }

    // Tạo comment mới (cho lesson, course hoặc exercise)
    @Transactional
    public Comment createComment(UUID lessonId, UUID courseId, UUID userId, String content, Integer rating, UUID parentCommentId, UUID exerciseId) {
        int providedCount = (lessonId != null ? 1 : 0) + (courseId != null ? 1 : 0) + (exerciseId != null ? 1 : 0);
        if (providedCount == 0) {
            throw new RuntimeException("Either lessonId, courseId, or exerciseId must be provided");
        }
        if (providedCount > 1) {
            throw new RuntimeException("Cannot specify more than one of lessonId, courseId, or exerciseId");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment.CommentBuilder commentBuilder = Comment.builder()
                .user(user)
                .content(content)
                .rating(rating)
                .isApproved(true); // Mặc định hiển thị ngay, admin có thể xóa sau

        if (lessonId != null) {
            Lesson lesson = lessonRepository.findById(lessonId)
                    .orElseThrow(() -> new RuntimeException("Lesson not found"));
            commentBuilder.lesson(lesson);
            commentBuilder.course(null);
            commentBuilder.exercise(null);
        } else if (exerciseId != null) {
            CodeExercise exercise = codeExerciseRepository.findById(exerciseId)
                    .orElseThrow(() -> new RuntimeException("Exercise not found"));
            commentBuilder.exercise(exercise);
            commentBuilder.lesson(null);
            commentBuilder.course(null);
        } else {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            commentBuilder.course(course);
            commentBuilder.lesson(null);
            commentBuilder.exercise(null);
        }

        Comment comment = commentBuilder.build();

        // Nếu là reply
        if (parentCommentId != null) {
            Comment parentComment = commentRepository.findById(parentCommentId)
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParentComment(parentComment);
        }

        return commentRepository.save(comment);
    }

    // Cập nhật comment
    @Transactional
    public Comment updateComment(UUID commentId, UUID userId, String content, Integer rating) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Chỉ cho phép user sở hữu comment hoặc admin mới được sửa
        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to update this comment");
        }

        comment.setContent(content);
        if (rating != null) {
            comment.setRating(rating);
        }
        // Comment vẫn hiển thị sau khi sửa (admin có thể xóa nếu cần)
        comment.setIsApproved(true);

        return commentRepository.save(comment);
    }

    // Xóa comment
    @Transactional
    public void deleteComment(UUID commentId, UUID userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Lấy user để check role
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Cho phép user sở hữu comment hoặc admin xóa
        boolean isOwner = comment.getUser().getId().equals(userId);
        boolean isAdmin = user.getRole() != null && user.getRole().name().equals("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("You don't have permission to delete this comment");
        }

        commentRepository.delete(comment);
    }
    
    // Admin xóa comment (không cần check ownership)
    @Transactional
    public void deleteCommentByAdmin(UUID commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        commentRepository.delete(comment);
    }

    // Admin duyệt comment
    @Transactional
    public Comment approveComment(UUID commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setIsApproved(true);
        return commentRepository.save(comment);
    }

    // Admin từ chối/xóa comment
    @Transactional
    public void rejectComment(UUID commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        commentRepository.delete(comment);
    }

    // Lấy tất cả comment (cho admin quản lý)
    public List<Comment> getAllComments() {
        return commentRepository.findAllComments();
    }
    
    // Lấy tất cả comment chưa duyệt (nếu cần trong tương lai)
    public List<Comment> getPendingComments() {
        return commentRepository.findPendingComments();
    }

    // Lấy comment theo ID
    public Comment getCommentById(UUID commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
    }

    // Đếm số comment của lesson
    public long countCommentsByLesson(UUID lessonId) {
        return commentRepository.countByLesson_LessonId(lessonId);
    }

    // Đếm số comment đã duyệt của lesson
    public long countApprovedCommentsByLesson(UUID lessonId) {
        return commentRepository.countByLesson_LessonIdAndIsApprovedTrue(lessonId);
    }
    
    // Lấy featured comments (comments có rating từ tất cả courses)
    public List<Comment> getFeaturedComments(int limit) {
        List<Comment> allFeatured = commentRepository.findFeaturedComments();
        if (limit > 0 && allFeatured.size() > limit) {
            return allFeatured.subList(0, limit);
        }
        return allFeatured;
    }
}

