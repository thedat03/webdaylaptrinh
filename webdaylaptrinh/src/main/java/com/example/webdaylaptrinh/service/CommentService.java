package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.entity.Comment;
import com.example.webdaylaptrinh.entity.CodeExercise;
import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.Lesson;
import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.entity.TACourseAssignment;
import com.example.webdaylaptrinh.repository.CodeExerciseRepository;
import com.example.webdaylaptrinh.repository.CommentRepository;
import com.example.webdaylaptrinh.repository.CourseRepository;
import com.example.webdaylaptrinh.repository.LessonRepository;
import com.example.webdaylaptrinh.repository.UserRepository;
import com.example.webdaylaptrinh.repository.TACourseAssignmentRepository;
import com.example.webdaylaptrinh.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final TACourseAssignmentRepository taCourseAssignmentRepository;
    private final NotificationService notificationService;

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

        Comment savedComment = commentRepository.save(comment);

        // Thông báo cho TA nếu là comment gốc (không phải reply)
        if (parentCommentId == null) {
            notifyTAsAboutNewComment(savedComment);
        }

        return savedComment;
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

    // TA trả lời comment (tạo reply và đánh dấu comment gốc đã được trả lời)
    @Transactional
    public Comment answerCommentAsTA(UUID commentId, UUID taId, String responseContent) {
        Comment originalComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        User ta = userRepository.findById(taId)
                .orElseThrow(() -> new RuntimeException("TA not found"));

        // Kiểm tra user có phải TA không
        if (ta.getRole() == null || !ta.getRole().name().equals("TEACHING_ASSISTANT")) {
            throw new RuntimeException("Only Teaching Assistants can answer comments");
        }

        // Tạo reply từ TA
        Comment reply = Comment.builder()
                .user(ta)
                .content(responseContent)
                .parentComment(originalComment)
                .lesson(originalComment.getLesson())
                .course(originalComment.getCourse())
                .exercise(originalComment.getExercise())
                .isApproved(true)
                .isAnswered(false)
                .build();

        Comment savedReply = commentRepository.save(reply);

        // Đánh dấu comment gốc đã được trả lời
        originalComment.setIsAnswered(true);
        originalComment.setAnsweredByTa(ta);
        originalComment.setAnsweredAt(LocalDateTime.now());
        commentRepository.save(originalComment);

        // Thông báo cho học viên đã đăng comment
        notifyStudentAboutTAAnswer(originalComment, savedReply, ta);

        return savedReply;
    }

    // Tạo thông báo cho TA khi có bình luận mới
    @Transactional
    public void notifyTAsAboutNewComment(Comment comment) {
        try {
            Course course = comment.getCourse();
            Lesson lesson = comment.getLesson();
            String lessonTitle = null;
            
            // Nếu comment thuộc lesson, load lesson để lấy course và title
            if (course == null && lesson != null) {
                Lesson fullLesson = lessonRepository.findById(lesson.getLesson_id()).orElse(null);
                if (fullLesson != null) {
                    lessonTitle = fullLesson.getTitle();
                    if (fullLesson.getModule() != null && fullLesson.getModule().getCourse() != null) {
                        course = fullLesson.getModule().getCourse();
                    }
                }
            }
            
            if (course == null) {
                return; // Không có khóa học liên quan
            }

            // Lấy tất cả TA được phân công cho khóa học này
            List<TACourseAssignment> assignments = taCourseAssignmentRepository.findByCourse_CourseId(course.getCourse_id());
            
            if (assignments.isEmpty()) {
                return; // Không có TA nào được phân công
            }
            
            String location = lessonTitle != null 
                ? String.format("bài học \"%s\"", lessonTitle)
                : String.format("khóa học \"%s\"", course.getCourse_name());
            
            String contentPreview = comment.getContent().length() > 100 
                ? comment.getContent().substring(0, 100) + "..." 
                : comment.getContent();
            
            for (TACourseAssignment assignment : assignments) {
                User ta = assignment.getTa();
                
                notificationService.createNotification(
                    ta.getId(),
                    "Bình luận mới cần trả lời",
                    String.format("Học viên %s đã bình luận tại %s: %s",
                        comment.getUser().getUsername(),
                        location,
                        contentPreview),
                    "NEW_COMMENT",
                    comment.getCommentId(),
                    lessonTitle != null ? "LESSON" : "COURSE"
                );
            }
        } catch (Exception e) {
            // Log error nhưng không throw để không ảnh hưởng đến việc tạo comment
            System.err.println("Error notifying TAs about new comment: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Thông báo cho học viên khi TA trả lời comment của họ
    @Transactional
    public void notifyStudentAboutTAAnswer(Comment originalComment, Comment taReply, User ta) {
        try {
            User student = originalComment.getUser();
            if (student == null || student.getId().equals(ta.getId())) {
                return; // Không thông báo nếu không có học viên hoặc TA tự trả lời chính mình
            }

            Course course = originalComment.getCourse();
            Lesson lesson = originalComment.getLesson();
            String location = "";
            
            // Xác định vị trí comment
            if (lesson != null) {
                Lesson fullLesson = lessonRepository.findById(lesson.getLesson_id()).orElse(null);
                if (fullLesson != null) {
                    location = String.format("bài học \"%s\"", fullLesson.getTitle());
                    if (fullLesson.getModule() != null && fullLesson.getModule().getCourse() != null) {
                        course = fullLesson.getModule().getCourse();
                    }
                }
            } else if (course != null) {
                location = String.format("khóa học \"%s\"", course.getCourse_name());
            } else {
                location = "khóa học";
            }

            String replyPreview = taReply.getContent().length() > 100 
                ? taReply.getContent().substring(0, 100) + "..." 
                : taReply.getContent();

            notificationService.createNotification(
                student.getId(),
                "Trợ giảng đã trả lời bình luận của bạn",
                String.format("Trợ giảng %s đã trả lời bình luận của bạn tại %s: %s",
                    ta.getUsername(),
                    location,
                    replyPreview),
                "TA_COMMENT_REPLY",
                originalComment.getCommentId(),
                lesson != null ? "LESSON" : "COURSE"
            );
        } catch (Exception e) {
            // Log error nhưng không throw để không ảnh hưởng đến việc trả lời comment
            System.err.println("Error notifying student about TA answer: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Lấy tất cả comment chưa được trả lời trong các khóa học mà TA được phép truy cập
    public List<Comment> getUnansweredCommentsForTA(UUID taId) {
        // Lấy danh sách khóa học mà TA được phân công
        List<TACourseAssignment> assignments = taCourseAssignmentRepository.findByTaId(taId);
        List<UUID> assignedCourseIds = assignments.stream()
                .map(a -> a.getCourse().getCourse_id())
                .toList();

        if (assignedCourseIds.isEmpty()) {
            return List.of(); // TA chưa được phân công khóa học nào
        }

        // Lấy tất cả comment chưa trả lời trong các khóa học được phân công (chỉ comment gốc, chưa bị ẩn)
        return commentRepository.findAll().stream()
                .filter(c -> c.getParentComment() == null) // Chỉ comment gốc
                .filter(c -> !Boolean.TRUE.equals(c.getIsAnswered())) // Chưa được trả lời
                .filter(c -> !Boolean.TRUE.equals(c.getIsHidden())) // Chưa bị ẩn
                .filter(c -> {
                    // Kiểm tra comment thuộc khóa học được phân công
                    if (c.getCourse() != null) {
                        return assignedCourseIds.contains(c.getCourse().getCourse_id());
                    }
                    // Nếu comment thuộc lesson, cần load lesson để lấy course
                    if (c.getLesson() != null) {
                        try {
                            Lesson lesson = lessonRepository.findById(c.getLesson().getLesson_id()).orElse(null);
                            if (lesson != null && lesson.getModule() != null && lesson.getModule().getCourse() != null) {
                                return assignedCourseIds.contains(lesson.getModule().getCourse().getCourse_id());
                            }
                        } catch (Exception e) {
                            // Ignore errors
                        }
                    }
                    return false;
                })
                .toList();
    }

    // Lấy tất cả comment trong khóa học (cho TA xem) - bao gồm cả bình luận đã ẩn
    public List<Comment> getCommentsForTA(UUID taId, UUID courseId) {
        // Kiểm tra TA có quyền truy cập khóa học
        taCourseAssignmentRepository.findByTaIdAndCourseId(taId, courseId)
                .orElseThrow(() -> new RuntimeException("TA doesn't have access to this course"));
        
        // Lấy tất cả comment (bao gồm cả đã ẩn) để TA có thể quản lý
        return commentRepository.findByCourse_CourseIdAndParentCommentIsNullOrderByCreatedAtDesc(courseId);
    }

    // Lấy tất cả comment trong bài học (cho TA xem) - bao gồm cả bình luận đã ẩn
    public List<Comment> getCommentsForTAByLesson(UUID taId, UUID lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        
        Course course = null;
        if (lesson.getModule() != null) {
            course = lesson.getModule().getCourse();
        }
        
        if (course == null) {
            throw new RuntimeException("Course not found for this lesson");
        }
        
        // Kiểm tra TA có quyền truy cập khóa học
        taCourseAssignmentRepository.findByTaIdAndCourseId(taId, course.getCourse_id())
                .orElseThrow(() -> new RuntimeException("TA doesn't have access to this course"));
        
        return commentRepository.findByLesson_LessonIdAndParentCommentIsNullOrderByCreatedAtDesc(lessonId);
    }

    // TA ẩn bình luận (soft delete)
    @Transactional
    public Comment hideCommentByTA(UUID commentId, UUID taId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        User ta = userRepository.findById(taId)
                .orElseThrow(() -> new RuntimeException("TA not found"));

        // Kiểm tra user có phải TA không
        if (ta.getRole() == null || !ta.getRole().name().equals("TEACHING_ASSISTANT")) {
            throw new RuntimeException("Only Teaching Assistants can hide comments");
        }

        comment.setIsHidden(true);
        return commentRepository.save(comment);
    }

    // TA hiện lại bình luận đã ẩn
    @Transactional
    public Comment unhideCommentByTA(UUID commentId, UUID taId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        User ta = userRepository.findById(taId)
                .orElseThrow(() -> new RuntimeException("TA not found"));

        // Kiểm tra user có phải TA không
        if (ta.getRole() == null || !ta.getRole().name().equals("TEACHING_ASSISTANT")) {
            throw new RuntimeException("Only Teaching Assistants can unhide comments");
        }

        comment.setIsHidden(false);
        return commentRepository.save(comment);
    }

    // TA xóa bình luận (hard delete)
    @Transactional
    public void deleteCommentByTA(UUID commentId, UUID taId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        User ta = userRepository.findById(taId)
                .orElseThrow(() -> new RuntimeException("TA not found"));

        // Kiểm tra user có phải TA không
        if (ta.getRole() == null || !ta.getRole().name().equals("TEACHING_ASSISTANT")) {
            throw new RuntimeException("Only Teaching Assistants can delete comments");
        }

        commentRepository.delete(comment);
    }

    // Lấy TẤT CẢ comment (cả đã trả lời và chưa trả lời) trong các khóa học mà TA được phép truy cập
    public List<Comment> getAllCommentsForTA(UUID taId) {
        // Lấy danh sách khóa học mà TA được phân công
        List<TACourseAssignment> assignments = taCourseAssignmentRepository.findByTaId(taId);
        List<UUID> assignedCourseIds = assignments.stream()
                .map(a -> a.getCourse().getCourse_id())
                .toList();

        if (assignedCourseIds.isEmpty()) {
            return List.of(); // TA chưa được phân công khóa học nào
        }

        // Lấy tất cả comment trong các khóa học được phân công (chỉ comment gốc, bao gồm cả đã ẩn để TA có thể quản lý)
        List<Comment> allComments = commentRepository.findAll();
        
        // Force load các trường lazy để đảm bảo dữ liệu đầy đủ khi serialize
        // Và populate course vào comment nếu comment thuộc lesson (vì module.course bị @JsonIgnore)
        for (Comment c : allComments) {
            if (c.getLesson() != null) {
                // Force load lesson và các trường liên quan
                org.hibernate.Hibernate.initialize(c.getLesson());
                if (c.getLesson().getModule() != null) {
                    org.hibernate.Hibernate.initialize(c.getLesson().getModule());
                    Course moduleCourse = c.getLesson().getModule().getCourse();
                    if (moduleCourse != null) {
                        org.hibernate.Hibernate.initialize(moduleCourse);
                        // Populate course vào comment để frontend có thể truy cập course name
                        // Vì module.course bị @JsonIgnore nên cần set trực tiếp vào comment.course
                        if (c.getCourse() == null) {
                            c.setCourse(moduleCourse);
                        }
                    }
                }
            }
            if (c.getCourse() != null) {
                org.hibernate.Hibernate.initialize(c.getCourse());
            }
            if (c.getExercise() != null) {
                org.hibernate.Hibernate.initialize(c.getExercise());
                // CodeExercise có quan hệ trực tiếp với Course, không qua Lesson
                if (c.getExercise().getCourse() != null) {
                    org.hibernate.Hibernate.initialize(c.getExercise().getCourse());
                    // Populate course vào comment nếu chưa có
                    if (c.getCourse() == null) {
                        c.setCourse(c.getExercise().getCourse());
                    }
                }
            }
        }
        
        return allComments.stream()
                .filter(c -> c.getParentComment() == null) // Chỉ comment gốc
                // Không filter isHidden ở đây - TA cần thấy tất cả comment (cả ẩn và chưa ẩn) để quản lý
                .filter(c -> {
                    // Kiểm tra comment thuộc khóa học được phân công
                    if (c.getCourse() != null) {
                        return assignedCourseIds.contains(c.getCourse().getCourse_id());
                    }
                    // Nếu comment thuộc lesson, cần load lesson để lấy course
                    if (c.getLesson() != null && c.getLesson().getModule() != null && c.getLesson().getModule().getCourse() != null) {
                        return assignedCourseIds.contains(c.getLesson().getModule().getCourse().getCourse_id());
                    }
                    // Nếu comment thuộc exercise, CodeExercise có quan hệ trực tiếp với Course
                    if (c.getExercise() != null && c.getExercise().getCourse() != null) {
                        return assignedCourseIds.contains(c.getExercise().getCourse().getCourse_id());
                    }
                    return false;
                })
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt())) // Sắp xếp mới nhất trước
                .toList();
    }
}

