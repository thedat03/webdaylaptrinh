package com.example.webdaylaptrinh.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "comments")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Comment {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "comment_id", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID commentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = true)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"comments", "module", "exercises"})
    private Lesson lesson; // null nếu comment cho course

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = true)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"comments", "modules", "lessons", "instructor"})
    private Course course; // null nếu comment cho lesson

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = true)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"comments", "lesson"})
    private CodeExercise exercise; // null nếu comment cho lesson hoặc course

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(name = "rating")
    private Integer rating; // 1-5 sao, null nếu không đánh giá

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    @JsonIgnore
    private Comment parentComment; // null nếu là comment gốc

    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Comment> replies;

    @Column(name = "is_approved", nullable = false)
    @Builder.Default
    private Boolean isApproved = true; // Mặc định hiển thị ngay, admin có thể xóa sau

    @Column(name = "is_hidden", nullable = false)
    @Builder.Default
    private Boolean isHidden = false; // Bình luận bị ẩn bởi TA/Admin

    @Column(name = "is_answered", nullable = false)
    @Builder.Default
    private Boolean isAnswered = false; // Đã được TA trả lời chưa

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "answered_by_ta_id", nullable = true)
    private User answeredByTa; // TA đã trả lời (null nếu chưa có)

    @Column(name = "answered_at")
    private LocalDateTime answeredAt; // Thời điểm TA trả lời

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isApproved == null) {
            isApproved = true; // Mặc định hiển thị ngay
        }
        if (isHidden == null) {
            isHidden = false;
        }
        if (isAnswered == null) {
            isAnswered = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (isAnswered != null && isAnswered && answeredAt == null && answeredByTa != null) {
            answeredAt = LocalDateTime.now();
        }
    }
}

