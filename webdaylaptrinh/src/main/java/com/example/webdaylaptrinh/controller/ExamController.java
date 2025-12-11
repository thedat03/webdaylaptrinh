package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.dto.ApiResponse;
import com.example.webdaylaptrinh.dto.ExamQuestionRequest;
import com.example.webdaylaptrinh.dto.ExamRequest;
import com.example.webdaylaptrinh.dto.ExamSubmitRequest;
import com.example.webdaylaptrinh.dto.TestCaseResult;
import com.example.webdaylaptrinh.dto.CodeTestCase;
import com.example.webdaylaptrinh.entity.Exam;
import com.example.webdaylaptrinh.entity.ExamQuestion;
import com.example.webdaylaptrinh.entity.ExamSubmission;
import com.example.webdaylaptrinh.security.UserPrincipal;
import com.example.webdaylaptrinh.service.ExamService;
import com.example.webdaylaptrinh.service.ExamSubmissionService;
import com.example.webdaylaptrinh.service.CodeExecutionService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class ExamController {

    private final ExamService examService;
    private final ExamSubmissionService examSubmissionService;
    private final ObjectMapper objectMapper;
    private final CodeExecutionService codeExecutionService;

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PostMapping("/courses/{courseId}/exams")
    public ResponseEntity<Exam> createExam(@PathVariable UUID courseId,
                                           @RequestBody ExamRequest request,
                                           Authentication authentication) {
        UUID userId = ((UserPrincipal) authentication.getPrincipal()).getId();
        Exam exam = examService.createExam(courseId, userId, request);
        return ResponseEntity.ok(exam);
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PutMapping("/exams/{examId}")
    public ResponseEntity<Exam> updateExam(@PathVariable UUID examId,
                                           @RequestBody ExamRequest request,
                                           Authentication authentication) {
        UUID userId = ((UserPrincipal) authentication.getPrincipal()).getId();
        Exam exam = examService.updateExam(examId, userId, request);
        return ResponseEntity.ok(exam);
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PostMapping("/exams/{examId}/questions")
    public ResponseEntity<ExamQuestion> addQuestion(@PathVariable UUID examId,
                                                    @RequestBody ExamQuestionRequest request,
                                                    Authentication authentication) {
        UUID userId = ((UserPrincipal) authentication.getPrincipal()).getId();
        ExamQuestion question = examService.addQuestion(examId, userId, request);
        return ResponseEntity.ok(question);
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PutMapping("/exams/questions/{questionId}")
    public ResponseEntity<ExamQuestion> updateQuestion(@PathVariable UUID questionId,
                                                       @RequestBody ExamQuestionRequest request,
                                                       Authentication authentication) {
        UUID userId = ((UserPrincipal) authentication.getPrincipal()).getId();
        ExamQuestion question = examService.updateQuestion(questionId, userId, request);
        return ResponseEntity.ok(question);
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @DeleteMapping("/exams/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable UUID questionId,
                                               Authentication authentication) {
        UUID userId = ((UserPrincipal) authentication.getPrincipal()).getId();
        examService.deleteQuestion(questionId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/courses/{courseId}/exams/published")
    public ResponseEntity<List<Exam>> getPublishedExams(@PathVariable UUID courseId) {
        try {
            return ResponseEntity.ok(examService.getPublishedExamsByCourse(courseId));
        } catch (RuntimeException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/courses/{courseId}/exams/published/{examId}")
    public ResponseEntity<Exam> getPublishedExam(@PathVariable UUID courseId, @PathVariable UUID examId) {
        try {
            List<Exam> exams = examService.getPublishedExamsByCourse(courseId);
            Exam exam = exams.stream()
                    .filter(e -> e.getId().equals(examId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Exam not found"));
            return ResponseEntity.ok(exam);
        } catch (RuntimeException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/courses/{courseId}/exams")
    public ResponseEntity<List<Exam>> getAllExams(@PathVariable UUID courseId,
                                                   Authentication authentication) {
        UUID userId = ((UserPrincipal) authentication.getPrincipal()).getId();
        return ResponseEntity.ok(examService.getAllExamsByCourse(courseId, userId));
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/courses/{courseId}/exams/owner")
    public ResponseEntity<Exam> getOwnerExam(@PathVariable UUID courseId,
                                             Authentication authentication) {
        UUID userId = ((UserPrincipal) authentication.getPrincipal()).getId();
        Exam exam = examService.getOwnerExamByCourse(courseId, userId);
        if (exam == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(exam);
    }

    @PostMapping("/exams/{examId}/submit")
    public ResponseEntity<ExamSubmission> submitExam(@PathVariable UUID examId,
                                                     @RequestBody ExamSubmitRequest request,
                                                     Authentication authentication) {
        UUID userId = ((UserPrincipal) authentication.getPrincipal()).getId();
        ExamSubmission submission = examSubmissionService.submit(examId, userId, request);
        return ResponseEntity.ok(submission);
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/exams/{examId}/submissions")
    public ResponseEntity<List<ExamSubmission>> getExamSubmissions(@PathVariable UUID examId) {
        return ResponseEntity.ok(examSubmissionService.getSubmissionsForExam(examId));
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/exams/{examId}/submissions/{submissionId}")
    public ResponseEntity<ExamSubmission> getSubmissionDetail(@PathVariable UUID submissionId) {
        return ResponseEntity.ok(examSubmissionService.getSubmissionDetail(submissionId));
    }

    @GetMapping("/exams/{examId}/my-submission")
    public ResponseEntity<ExamSubmission> getMyLatestSubmission(@PathVariable UUID examId,
                                                                Authentication authentication) {
        UUID userId = ((UserPrincipal) authentication.getPrincipal()).getId();
        return examSubmissionService.getMyLatestSubmission(examId, userId);
    }

    @GetMapping("/exams/{examId}/my-submissions")
    public ResponseEntity<List<ExamSubmission>> getMySubmissions(@PathVariable UUID examId,
                                                                 Authentication authentication) {
        UUID userId = ((UserPrincipal) authentication.getPrincipal()).getId();
        List<ExamSubmission> submissions = examSubmissionService.getMySubmissions(examId, userId);
        return ResponseEntity.ok(submissions);
    }

    /**
     * Chạy thử code cho 1 câu hỏi trước khi nộp bài.
     */
    @PostMapping("/exams/{examId}/questions/{questionId}/run")
    public ResponseEntity<List<TestCaseResult>> runCodeQuestion(@PathVariable UUID questionId,
                                                                @RequestBody String body) {
        try {
            var node = objectMapper.readTree(body);
            String source = node.path("sourceCode").asText();
            String testCases = node.path("testCases").asText();
            Integer languageId = node.path("languageId").isInt() ? node.path("languageId").asInt() : null;
            if (!StringUtils.hasText(source) || !StringUtils.hasText(testCases) || languageId == null) {
                return ResponseEntity.badRequest().build();
            }
            List<CodeTestCase> parsed = objectMapper.readValue(testCases, new TypeReference<>() {});
            List<TestCaseResult> results = codeExecutionService.executeAdhocCode(languageId, source, parsed);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Run code error", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}

