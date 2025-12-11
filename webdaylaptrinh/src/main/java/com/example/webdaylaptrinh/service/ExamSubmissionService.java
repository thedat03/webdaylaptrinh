package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.dto.CodeTestCase;
import com.example.webdaylaptrinh.dto.ExamSubmitRequest;
import com.example.webdaylaptrinh.dto.TestCaseResult;
import com.example.webdaylaptrinh.entity.*;
import com.example.webdaylaptrinh.enums.QuestionType;
import com.example.webdaylaptrinh.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExamSubmissionService {

    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final ExamSubmissionRepository examSubmissionRepository;
    private final ExamSubmissionAnswerRepository examSubmissionAnswerRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final CodeExecutionService codeExecutionService;

    @Transactional
    public ExamSubmission submit(UUID examId, UUID userId, ExamSubmitRequest request) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ExamQuestion> questions = examQuestionRepository.findByExam(exam);
        if (questions.isEmpty()) {
            throw new RuntimeException("Exam chưa có câu hỏi");
        }

        ExamSubmission submission = ExamSubmission.builder()
                .exam(exam)
                .user(user)
                .build();

        double totalScore = 0.0;
        double maxScore = 0.0;
        List<ExamSubmissionAnswer> answers = new ArrayList<>();

        for (ExamQuestion question : questions) {
            ExamSubmissionAnswer answer = ExamSubmissionAnswer.builder()
                    .submission(submission)
                    .question(question)
                    .build();

            ExamSubmitRequest.AnswerPayload payload = request.getAnswers().stream()
                    .filter(a -> a.getQuestionId().equals(question.getId()))
                    .findFirst()
                    .orElse(null);

            double questionMax = question.getMaxScore() != null ? question.getMaxScore() : 1.0;
            maxScore += questionMax;

            if (question.getType() == QuestionType.MCQ) {
                String selected = payload != null ? payload.getSelectedOption() : null;
                answer.setSelectedOption(selected);
                boolean correct = StringUtils.hasText(selected) && selected.equals(question.getAnswer());
                answer.setPassed(correct);
                if (correct) {
                    answer.setScore(questionMax);
                    totalScore += questionMax;
                } else {
                    answer.setScore(0.0);
                }
            } else {
                // CODE question
                String code = payload != null ? payload.getCodeAnswer() : null;
                answer.setCodeAnswer(code);
                if (!StringUtils.hasText(code)) {
                    answer.setScore(0.0);
                    answer.setPassed(false);
                } else {
                    String testCasesJson = question.getTestCases();
                    if (!StringUtils.hasText(testCasesJson)) {
                        // Nếu không có test case, cho điểm 0
                        answer.setScore(0.0);
                        answer.setPassed(false);
                        answer.setAutoResult("[]");
                    } else {
                        try {
                            List<CodeTestCase> testCases = parseTestCases(testCasesJson);
                            if (testCases.isEmpty()) {
                                answer.setScore(0.0);
                                answer.setPassed(false);
                                answer.setAutoResult("[]");
                            } else {
                                List<TestCaseResult> results = codeExecutionService.executeAdhocCode(
                                        question.getLanguageId(),
                                        code,
                                        testCases
                                );
                                boolean allPassed = results.stream().allMatch(TestCaseResult::isPassed);
                                answer.setPassed(allPassed);
                                answer.setScore(allPassed ? questionMax : 0.0);
                                answer.setAutoResult(writeResults(results));
                                totalScore += answer.getScore();
                            }
                        } catch (Exception e) {
                            // Nếu parse hoặc execute lỗi, cho điểm 0
                            answer.setScore(0.0);
                            answer.setPassed(false);
                            answer.setAutoResult("[]");
                        }
                    }
                }
            }
            answers.add(answer);
        }

        submission.setTotalScore(totalScore);
        submission.setMaxScore(maxScore);
        submission.setPassed(totalScore >= (0.6 * maxScore));
        submission.setAnswers(answers);

        ExamSubmission saved = examSubmissionRepository.save(submission);
        answers.forEach(a -> a.setSubmission(saved));
        examSubmissionAnswerRepository.saveAll(answers);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<ExamSubmission> getSubmissionsForExam(UUID examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        return examSubmissionRepository.findByExam(exam);
    }

    @Transactional(readOnly = true)
    public ExamSubmission getSubmissionDetail(UUID submissionId) {
        return examSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<ExamSubmission> getMyLatestSubmission(UUID examId, UUID userId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return examSubmissionRepository.findTopByExamAndUserOrderBySubmittedAtDesc(exam, user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Transactional(readOnly = true)
    public List<ExamSubmission> getMySubmissions(UUID examId, UUID userId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return examSubmissionRepository.findByExamAndUserOrderBySubmittedAtDesc(exam, user);
    }

    private List<CodeTestCase> parseTestCases(String testCasesJson) {
        if (!StringUtils.hasText(testCasesJson)) {
            return new ArrayList<>();
        }
        try {
            String cleaned = testCasesJson.trim();
            
            // Nếu là string JSON được escape (bắt đầu và kết thúc bằng ")
            if (cleaned.startsWith("\"") && cleaned.endsWith("\"")) {
                cleaned = objectMapper.readValue(cleaned, String.class);
            }
            
            // Parse JSON array
            if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
                return objectMapper.readValue(cleaned, new TypeReference<List<CodeTestCase>>() {});
            }
            
            // Nếu không phải array, thử parse như object đơn lẻ và wrap vào list
            try {
                CodeTestCase single = objectMapper.readValue(cleaned, CodeTestCase.class);
                return List.of(single);
            } catch (Exception e) {
                // Nếu không parse được, trả về empty list
                return new ArrayList<>();
            }
        } catch (Exception e) {
            // Log lỗi nhưng không throw exception, trả về empty list để không làm crash toàn bộ submission
            System.err.println("Error parsing test cases: " + e.getMessage());
            System.err.println("Test cases JSON: " + testCasesJson);
            return new ArrayList<>();
        }
    }

    private String writeResults(List<TestCaseResult> results) {
        try {
            return objectMapper.writeValueAsString(results);
        } catch (Exception e) {
            return "[]";
        }
    }
}

