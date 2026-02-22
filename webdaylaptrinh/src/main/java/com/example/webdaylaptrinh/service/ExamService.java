package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.dto.ExamQuestionRequest;
import com.example.webdaylaptrinh.dto.ExamRequest;
import com.example.webdaylaptrinh.entity.*;
import com.example.webdaylaptrinh.enums.QuestionType;
import com.example.webdaylaptrinh.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final ExamSubmissionRepository examSubmissionRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final LearningRepository learningRepository;
    private final NotificationService notificationService;

    private void assertOwner(UUID courseId, UUID userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        if (course.getUser() == null || !course.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Bạn không phải giáo viên của khóa học này");
        }
    }

    @Transactional
    public Exam createExam(UUID courseId, UUID creatorId, ExamRequest request) {
        assertOwner(courseId, creatorId);
        Course course = courseRepository.findById(courseId).orElseThrow();
        User creator = userRepository.findById(creatorId).orElseThrow();
        if (request.getMaxAttempts() == null || request.getMaxAttempts() < 1) {
            throw new RuntimeException("Vui lòng nhập số lần làm tối đa (>= 1)");
        }

        Exam exam = Exam.builder()
                .title(StringUtils.hasText(request.getTitle()) ? request.getTitle() : "Bài thi")
                .description(request.getDescription())
                .course(course)
                .createdBy(creator)
                .published(request.isPublished())
                .maxAttempts(request.getMaxAttempts())
                .build();

        Exam saved = examRepository.save(exam);
        if (saved.isPublished()) {
            notifyExamPublished(saved);
        }
        return saved;
    }

    @Transactional
    public Exam updateExam(UUID examId, UUID userId, ExamRequest request) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        assertOwner(exam.getCourse().getCourse_id(), userId);
        if (request.getMaxAttempts() == null || request.getMaxAttempts() < 1) {
            throw new RuntimeException("Vui lòng nhập số lần làm tối đa (>= 1)");
        }

        exam.setTitle(request.getTitle());
        exam.setDescription(request.getDescription());
        boolean wasPublished = exam.isPublished();
        if (request.getMaxAttempts() != null) {
            exam.setMaxAttempts(request.getMaxAttempts());
        }
        exam.setPublished(request.isPublished());
        Exam saved = examRepository.save(exam);

        if (!wasPublished && saved.isPublished()) {
            notifyExamPublished(saved);
        }
        return saved;
    }

    @Transactional
    public ExamQuestion addQuestion(UUID examId, UUID userId, ExamQuestionRequest request) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        assertOwner(exam.getCourse().getCourse_id(), userId);

        ExamQuestion question = ExamQuestion.builder()
                .exam(exam)
                .type(request.getType() != null ? request.getType() : QuestionType.MCQ)
                .prompt(request.getPrompt())
                .option1(request.getOption1())
                .option2(request.getOption2())
                .option3(request.getOption3())
                .option4(request.getOption4())
                .answer(request.getAnswer())
                .languageId(request.getLanguageId())
                .starterCode(request.getStarterCode())
                .testCases(request.getTestCases())
                .maxScore(request.getMaxScore() != null ? request.getMaxScore() : 1.0)
                .build();
        return examQuestionRepository.save(question);
    }

    @Transactional
    public ExamQuestion updateQuestion(UUID questionId, UUID userId, ExamQuestionRequest request) {
        ExamQuestion question = examQuestionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        assertOwner(question.getExam().getCourse().getCourse_id(), userId);

        question.setType(request.getType() != null ? request.getType() : question.getType());
        question.setPrompt(request.getPrompt());
        question.setOption1(request.getOption1());
        question.setOption2(request.getOption2());
        question.setOption3(request.getOption3());
        question.setOption4(request.getOption4());
        question.setAnswer(request.getAnswer());
        question.setLanguageId(request.getLanguageId());
        question.setStarterCode(request.getStarterCode());
        question.setTestCases(request.getTestCases());
        question.setMaxScore(request.getMaxScore() != null ? request.getMaxScore() : question.getMaxScore());

        return examQuestionRepository.save(question);
    }

    @Transactional
    public void deleteQuestion(UUID questionId, UUID userId) {
        ExamQuestion question = examQuestionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        assertOwner(question.getExam().getCourse().getCourse_id(), userId);
        examQuestionRepository.delete(question);
    }

    @Transactional
    public void deleteExam(UUID examId, UUID userId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        assertOwner(exam.getCourse().getCourse_id(), userId);

        long submissionCount = examSubmissionRepository.countByExam(exam);
        if (submissionCount > 0) {
            throw new RuntimeException("Không thể xóa đề thi đã có bài nộp");
        }

        examRepository.delete(exam);
    }

    @Transactional(readOnly = true)
    public List<ExamQuestion> getQuestions(UUID examId, UUID userId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        if (userId != null) {
            assertOwner(exam.getCourse().getCourse_id(), userId);
        }
        return examQuestionRepository.findByExam(exam);
    }

    @Transactional(readOnly = true)
    public Exam getPublishedExamByCourse(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return examRepository.findFirstByCourseAndPublishedTrueOrderByCreatedAtDesc(course)
                .orElseThrow(() -> new RuntimeException("Chưa có đề thi được công bố"));
    }

    @Transactional(readOnly = true)
    public Exam getOwnerExamByCourse(UUID courseId, UUID ownerId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        assertOwner(courseId, ownerId);
        return examRepository.findByCourseAndCreatedBy(course, course.getUser())
                .stream()
                .findFirst()
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<Exam> getAllExamsByCourse(UUID courseId, UUID ownerId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        assertOwner(courseId, ownerId);
        return examRepository.findByCourseAndCreatedBy(course, course.getUser());
    }

    @Transactional(readOnly = true)
    public List<Exam> getPublishedExamsByCourse(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return examRepository.findByCourseAndPublishedTrue(course);
    }

    private void notifyExamPublished(Exam exam) {
        List<Learning> enrollments = learningRepository.findByCourse_CourseId(exam.getCourse().getCourse_id());
        for (Learning learning : enrollments) {
            notificationService.createNotification(
                    learning.getUser().getId(),
                    "Khóa học có đề thi mới",
                    String.format("Đã có đề thi \"%s\" cho khóa \"%s\". Hãy vào làm bài!", exam.getTitle(), exam.getCourse().getCourse_name()),
                    "EXAM_PUBLISHED",
                    exam.getId(),
                    "EXAM"
            );
        }
    }
}

