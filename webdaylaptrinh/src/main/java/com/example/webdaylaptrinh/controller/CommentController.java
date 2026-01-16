package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.entity.Comment;
import com.example.webdaylaptrinh.service.CommentService;
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
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private com.example.webdaylaptrinh.repository.UserRepository userRepository;

    // Lấy tất cả comment đã duyệt của một lesson
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<Comment>> getCommentsByLesson(@PathVariable UUID lessonId) {
        try {
            List<Comment> comments = commentService.getApprovedCommentsByLesson(lessonId);
            // Sắp xếp lại theo thời gian tạo (mới nhất trước)
            comments.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Lấy tất cả comment đã duyệt của một course
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Comment>> getCommentsByCourse(@PathVariable UUID courseId) {
        try {
            List<Comment> comments = commentService.getApprovedCommentsByCourse(courseId);
            // Sắp xếp lại theo thời gian tạo (mới nhất trước)
            comments.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Lấy tất cả comment đã duyệt của một exercise
    @GetMapping("/exercise/{exerciseId}")
    public ResponseEntity<List<Comment>> getCommentsByExercise(@PathVariable UUID exerciseId) {
        try {
            List<Comment> comments = commentService.getApprovedCommentsByExercise(exerciseId);
            // Sắp xếp lại theo thời gian tạo (mới nhất trước)
            comments.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Lấy tất cả comment (bao gồm chưa duyệt) - cho admin
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/lesson/{lessonId}/all")
    public ResponseEntity<List<Comment>> getAllCommentsByLesson(@PathVariable UUID lessonId) {
        try {
            List<Comment> comments = commentService.getAllCommentsByLesson(lessonId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Lấy tất cả comment của một course (cho admin)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/course/{courseId}/all")
    public ResponseEntity<List<Comment>> getAllCommentsByCourse(@PathVariable UUID courseId) {
        try {
            List<Comment> comments = commentService.getAllCommentsByCourse(courseId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Lấy reply của một comment
    @GetMapping("/{commentId}/replies")
    public ResponseEntity<List<Comment>> getRepliesByComment(@PathVariable UUID commentId) {
        try {
            List<Comment> replies = commentService.getRepliesByCommentId(commentId);
            return ResponseEntity.ok(replies);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Tạo comment mới (cho lesson hoặc course)
    @PostMapping
    public ResponseEntity<?> createComment(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            
            UUID userId = getUserIdFromEmail(email);
            
            // Parse lessonId
            UUID lessonId = null;
            if (request.get("lessonId") != null) {
                String lessonIdStr = request.get("lessonId").toString().trim();
                if (!lessonIdStr.isEmpty()) {
                    try {
                        lessonId = UUID.fromString(lessonIdStr);
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("error", "Invalid lessonId format: " + lessonIdStr));
                    }
                }
            }
            
            // Parse courseId
            UUID courseId = null;
            if (request.get("courseId") != null) {
                String courseIdStr = request.get("courseId").toString().trim();
                if (!courseIdStr.isEmpty()) {
                    try {
                        courseId = UUID.fromString(courseIdStr);
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("error", "Invalid courseId format: " + courseIdStr));
                    }
                }
            }
            
            // Parse exerciseId
            UUID exerciseId = null;
            if (request.get("exerciseId") != null) {
                String exerciseIdStr = request.get("exerciseId").toString().trim();
                if (!exerciseIdStr.isEmpty()) {
                    try {
                        exerciseId = UUID.fromString(exerciseIdStr);
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("error", "Invalid exerciseId format: " + exerciseIdStr));
                    }
                }
            }
            
            // Validate content
            if (request.get("content") == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Content is required"));
            }
            String content = request.get("content").toString().trim();
            if (content.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Content cannot be empty"));
            }
            
            // Parse rating
            Integer rating = null;
            if (request.get("rating") != null) {
                try {
                    Object ratingObj = request.get("rating");
                    if (ratingObj instanceof Number) {
                        rating = ((Number) ratingObj).intValue();
                    } else {
                        rating = Integer.parseInt(ratingObj.toString());
                    }
                    // Validate rating range
                    if (rating < 1 || rating > 5) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("error", "Rating must be between 1 and 5"));
                    }
                } catch (NumberFormatException e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Invalid rating format"));
                }
            }
            
            // Parse parentCommentId
            UUID parentCommentId = null;
            if (request.get("parentCommentId") != null) {
                String parentCommentIdStr = request.get("parentCommentId").toString().trim();
                if (!parentCommentIdStr.isEmpty()) {
                    try {
                        parentCommentId = UUID.fromString(parentCommentIdStr);
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("error", "Invalid parentCommentId format"));
                    }
                }
            }

            Comment comment = commentService.createComment(lessonId, courseId, userId, content, rating, parentCommentId, exerciseId);
            return ResponseEntity.status(HttpStatus.CREATED).body(comment);
        } catch (RuntimeException e) {
            // Log error for debugging
            System.err.println("Error creating comment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to create comment"));
        } catch (Exception e) {
            // Log unexpected errors
            System.err.println("Unexpected error creating comment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }

    // Cập nhật comment
    @PutMapping("/{commentId}")
    public ResponseEntity<Comment> updateComment(
            @PathVariable UUID commentId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            UUID userId = getUserIdFromEmail(email);

            String content = request.get("content").toString();
            Integer rating = request.get("rating") != null ? Integer.parseInt(request.get("rating").toString()) : null;

            Comment comment = commentService.updateComment(commentId, userId, content, rating);
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Xóa comment
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID commentId, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            UUID userId = getUserIdFromEmail(email);

            commentService.deleteComment(commentId, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            // Log error để debug
            System.err.println("Error deleting comment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            System.err.println("Unexpected error deleting comment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Admin duyệt comment
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{commentId}/approve")
    public ResponseEntity<Comment> approveComment(@PathVariable UUID commentId) {
        try {
            Comment comment = commentService.approveComment(commentId);
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Admin từ chối comment
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{commentId}/reject")
    public ResponseEntity<Void> rejectComment(@PathVariable UUID commentId) {
        try {
            commentService.rejectComment(commentId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Lấy tất cả comment (cho admin quản lý)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<Comment>> getAllComments() {
        try {
            List<Comment> comments = commentService.getAllComments();
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Lấy tất cả comment chưa duyệt (nếu cần trong tương lai)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pending")
    public ResponseEntity<List<Comment>> getPendingComments() {
        try {
            List<Comment> comments = commentService.getPendingComments();
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Lấy featured comments (comments có rating từ tất cả courses) - Public endpoint
    @GetMapping("/featured")
    public ResponseEntity<List<Comment>> getFeaturedComments(@RequestParam(value = "limit", defaultValue = "6") int limit) {
        try {
            List<Comment> comments = commentService.getFeaturedComments(limit);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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

