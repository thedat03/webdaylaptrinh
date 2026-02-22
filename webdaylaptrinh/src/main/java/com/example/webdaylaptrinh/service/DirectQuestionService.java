package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.entity.*;
import com.example.webdaylaptrinh.entity.DirectQuestion.DirectQuestionStatus;
import com.example.webdaylaptrinh.repository.*;
import com.example.webdaylaptrinh.enums.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DirectQuestionService {

    private final DirectQuestionRepository directQuestionRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final TACourseAssignmentRepository taCourseAssignmentRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;

    /**
     * Học viên tạo câu hỏi "Hỏi trực tiếp"
     */
    @Transactional
    public DirectQuestion createDirectQuestion(UUID studentId, String content, UUID courseId, UUID lessonId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        DirectQuestion.DirectQuestionBuilder builder = DirectQuestion.builder()
                .student(student)
                .content(content)
                .status(DirectQuestionStatus.PENDING);

        if (courseId != null) {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            builder.course(course);
        }

        if (lessonId != null) {
            Lesson lesson = lessonRepository.findById(lessonId)
                    .orElseThrow(() -> new RuntimeException("Lesson not found"));
            builder.lesson(lesson);
        }

        DirectQuestion question = builder.build();
        DirectQuestion saved = directQuestionRepository.save(question);

        // Tự động phân công TA nếu có TA online
        assignAvailableTA(saved);

        return saved;
    }

    /**
     * Tự động phân công TA đang online/sẵn sàng
     * Logic: Chọn TA ngẫu nhiên từ danh sách TA có quyền truy cập khóa học (nếu có)
     */
    private void assignAvailableTA(DirectQuestion question) {
        // Lấy danh sách TA có quyền truy cập khóa học
        List<User> availableTAs;
        
        if (question.getCourse() != null) {
            // Lấy TA được phân công cho khóa học này
            List<TACourseAssignment> assignments = taCourseAssignmentRepository.findByCourseId(question.getCourse().getCourse_id());
            availableTAs = assignments.stream()
                    .map(TACourseAssignment::getTa)
                    .filter(ta -> ta.getRole() == UserRole.TEACHING_ASSISTANT && ta.getIsActive())
                    .collect(Collectors.toList());
        } else {
            // Nếu không có khóa học cụ thể, lấy tất cả TA
            availableTAs = userRepository.findAll().stream()
                    .filter(user -> user.getRole() == UserRole.TEACHING_ASSISTANT && user.getIsActive())
                    .collect(Collectors.toList());
        }

        if (!availableTAs.isEmpty()) {
            // Chọn TA ngẫu nhiên (có thể cải thiện bằng cách chọn TA có ít câu hỏi đang xử lý nhất)
            User selectedTA = availableTAs.get((int) (Math.random() * availableTAs.size()));
            question.setTa(selectedTA);
            question.setStatus(DirectQuestionStatus.ASSIGNED);
            directQuestionRepository.save(question);
        }
        // Nếu không có TA, giữ status = PENDING, sẽ được xử lý sau
    }

    /**
     * TA trả lời câu hỏi
     */
    @Transactional
    public DirectQuestion answerQuestion(UUID questionId, UUID taId, String response) {
        DirectQuestion question = directQuestionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // Kiểm tra TA có quyền trả lời không
        if (question.getTa() == null || !question.getTa().getId().equals(taId)) {
            throw new RuntimeException("You don't have permission to answer this question");
        }

        question.setTaResponse(response);
        question.setStatus(DirectQuestionStatus.ANSWERED);
        question.setRespondedAt(LocalDateTime.now());
        
        DirectQuestion saved = directQuestionRepository.save(question);
        
        // Tạo thông báo cho học viên khi TA trả lời
        try {
            User student = question.getStudent();
            User ta = question.getTa();
            String courseName = question.getCourse() != null ? question.getCourse().getCourse_name() : "khóa học";
            
            notificationService.createNotification(
                    student.getId(),
                    "Trợ giảng đã trả lời câu hỏi của bạn",
                    String.format("Trợ giảng %s đã trả lời câu hỏi của bạn trong %s. Hãy xem câu trả lời trong phần chat!", 
                            ta.getUsername(), courseName),
                    "TA_ANSWER",
                    questionId,
                    "DIRECT_QUESTION"
            );
        } catch (Exception e) {
            // Log error nhưng không throw để không ảnh hưởng đến việc trả lời câu hỏi
            System.err.println("Error creating notification for TA answer: " + e.getMessage());
        }
        
        return saved;
    }

    /**
     * Chuyển câu hỏi thành comment thường (khi không có TA online)
     */
    @Transactional
    public Comment convertToComment(UUID questionId) {
        DirectQuestion question = directQuestionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // Tạo comment từ câu hỏi
        Comment comment = Comment.builder()
                .user(question.getStudent())
                .content(question.getContent())
                .course(question.getCourse())
                .lesson(question.getLesson())
                .isApproved(true)
                .isAnswered(false)
                .build();

        Comment savedComment = commentRepository.save(comment);

        // Đánh dấu đã chuyển
        question.setConvertedToComment(true);
        question.setStatus(DirectQuestionStatus.CONVERTED);
        directQuestionRepository.save(question);

        return savedComment;
    }

    /**
     * Lấy tất cả câu hỏi của học viên
     */
    public List<DirectQuestion> getStudentQuestions(UUID studentId) {
        return directQuestionRepository.findByStudentId(studentId);
    }

    /**
     * Lấy tất cả câu hỏi được phân công cho TA
     */
    public List<DirectQuestion> getTAQuestions(UUID taId) {
        return directQuestionRepository.findByTaId(taId);
    }

    /**
     * Lấy câu hỏi đang chờ (chưa có TA)
     */
    public List<DirectQuestion> getPendingQuestions() {
        return directQuestionRepository.findByStatus(DirectQuestionStatus.PENDING);
    }

    /**
     * TA tự nhận câu hỏi đang chờ
     */
    @Transactional
    public DirectQuestion claimQuestion(UUID questionId, UUID taId) {
        DirectQuestion question = directQuestionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (question.getStatus() != DirectQuestionStatus.PENDING) {
            throw new RuntimeException("Question is not available for claiming");
        }

        User ta = userRepository.findById(taId)
                .orElseThrow(() -> new RuntimeException("TA not found"));

        // Kiểm tra TA có quyền truy cập khóa học không (nếu có)
        if (question.getCourse() != null) {
            Optional<TACourseAssignment> assignment = taCourseAssignmentRepository
                    .findByTaIdAndCourseId(taId, question.getCourse().getCourse_id());
            if (assignment.isEmpty()) {
                throw new RuntimeException("You don't have permission to access this course");
            }
        }

        question.setTa(ta);
        question.setStatus(DirectQuestionStatus.ASSIGNED);
        return directQuestionRepository.save(question);
    }

    /**
     * Học viên đánh dấu câu hỏi đã giải quyết và đánh giá
     */
    @Transactional
    public DirectQuestion markAsResolved(UUID questionId, UUID studentId, Integer rating) {
        DirectQuestion question = directQuestionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // Kiểm tra quyền sở hữu
        if (!question.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("You don't have permission to mark this question as resolved");
        }

        // Chỉ cho phép đánh dấu nếu đã được trả lời
        if (question.getStatus() != DirectQuestionStatus.ANSWERED) {
            throw new RuntimeException("Question must be answered before marking as resolved");
        }

        question.setIsResolved(true);
        question.setResolvedAt(LocalDateTime.now());
        
        if (rating != null && rating >= 1 && rating <= 5) {
            question.setRating(rating);
        }

        return directQuestionRepository.save(question);
    }
}
