package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.entity.Comment;
import com.example.webdaylaptrinh.entity.DirectQuestion;
import com.example.webdaylaptrinh.service.DirectQuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/direct-questions")
public class DirectQuestionController {

    @Autowired
    private DirectQuestionService directQuestionService;

    @Autowired
    private com.example.webdaylaptrinh.repository.UserRepository userRepository;

    // Học viên tạo câu hỏi "Hỏi trực tiếp"
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'STUDENT', 'TEACHING_ASSISTANT')")
    public ResponseEntity<?> createDirectQuestion(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            UUID studentId = getUserIdFromEmail(email);

            String content = request.get("content").toString();
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Content is required"));
            }

            UUID courseId = null;
            if (request.get("courseId") != null) {
                try {
                    courseId = UUID.fromString(request.get("courseId").toString());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Invalid courseId format"));
                }
            }

            UUID lessonId = null;
            if (request.get("lessonId") != null) {
                try {
                    lessonId = UUID.fromString(request.get("lessonId").toString());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Invalid lessonId format"));
                }
            }

            DirectQuestion question = directQuestionService.createDirectQuestion(studentId, content, courseId, lessonId);
            return ResponseEntity.status(HttpStatus.CREATED).body(question);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // TA trả lời câu hỏi
    @PostMapping("/{questionId}/answer")
    @PreAuthorize("hasRole('TEACHING_ASSISTANT')")
    public ResponseEntity<?> answerQuestion(@PathVariable UUID questionId, @RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            UUID taId = getUserIdFromEmail(email);

            String response = request.get("response").toString();
            if (response == null || response.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Response is required"));
            }

            DirectQuestion question = directQuestionService.answerQuestion(questionId, taId, response);
            return ResponseEntity.ok(question);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Chuyển câu hỏi thành comment (khi không có TA online)
    @PostMapping("/{questionId}/convert-to-comment")
    @PreAuthorize("hasAnyRole('USER', 'STUDENT', 'TEACHING_ASSISTANT')")
    public ResponseEntity<?> convertToComment(@PathVariable UUID questionId, Authentication authentication) {
        try {
            Comment comment = directQuestionService.convertToComment(questionId);
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Lấy tất cả câu hỏi của học viên
    @GetMapping("/my-questions")
    @PreAuthorize("hasAnyRole('USER', 'STUDENT', 'TEACHING_ASSISTANT')")
    public ResponseEntity<List<DirectQuestion>> getMyQuestions(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            UUID studentId = getUserIdFromEmail(email);

            List<DirectQuestion> questions = directQuestionService.getStudentQuestions(studentId);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Lấy tất cả câu hỏi được phân công cho TA
    @GetMapping("/ta/my-assigned")
    @PreAuthorize("hasRole('TEACHING_ASSISTANT')")
    public ResponseEntity<List<DirectQuestion>> getMyAssignedQuestions(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            UUID taId = getUserIdFromEmail(email);

            List<DirectQuestion> questions = directQuestionService.getTAQuestions(taId);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Lấy câu hỏi đang chờ (cho TA xem và nhận)
    @GetMapping("/pending")
    @PreAuthorize("hasRole('TEACHING_ASSISTANT')")
    public ResponseEntity<List<DirectQuestion>> getPendingQuestions() {
        try {
            List<DirectQuestion> questions = directQuestionService.getPendingQuestions();
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // TA tự nhận câu hỏi đang chờ
    @PostMapping("/{questionId}/claim")
    @PreAuthorize("hasRole('TEACHING_ASSISTANT')")
    public ResponseEntity<?> claimQuestion(@PathVariable UUID questionId, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            UUID taId = getUserIdFromEmail(email);

            DirectQuestion question = directQuestionService.claimQuestion(questionId, taId);
            return ResponseEntity.ok(question);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Học viên đánh dấu câu hỏi đã giải quyết và đánh giá
    @PostMapping("/{questionId}/mark-resolved")
    @PreAuthorize("hasAnyRole('USER', 'STUDENT', 'TEACHING_ASSISTANT')")
    public ResponseEntity<?> markAsResolved(@PathVariable UUID questionId, @RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            UUID studentId = getUserIdFromEmail(email);

            Integer rating = null;
            if (request.get("rating") != null) {
                try {
                    rating = Integer.parseInt(request.get("rating").toString());
                } catch (NumberFormatException e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Invalid rating format"));
                }
            }

            DirectQuestion question = directQuestionService.markAsResolved(questionId, studentId, rating);
            return ResponseEntity.ok(question);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    private UUID getUserIdFromEmail(String email) {
        com.example.webdaylaptrinh.entity.User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return user.getId();
    }
}
