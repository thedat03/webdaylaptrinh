package com.example.webdaylaptrinh.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity cho chức năng "Hỏi trực tiếp" - học viên kết nối với TA
 */
@Entity
@Table(name = "direct_questions")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DirectQuestion {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student; // Học viên tạo câu hỏi

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ta_id", nullable = true)
    private User ta; // TA được phân công (null nếu chưa có TA online)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = true)
    @JsonIgnore
    private Course course; // Khóa học liên quan (optional)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = true)
    @JsonIgnore
    private Lesson lesson; // Bài học liên quan (optional)

    @Column(nullable = false, length = 2000)
    private String content; // Nội dung câu hỏi

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DirectQuestionStatus status = DirectQuestionStatus.PENDING; // Trạng thái

    @Column(name = "ta_response", length = 2000)
    @JsonProperty("taResponse")
    private String taResponse; // Phản hồi của TA

    @Column(name = "converted_to_comment")
    @Builder.Default
    private Boolean convertedToComment = false; // Đã chuyển thành comment thường chưa

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt; // Thời điểm TA phản hồi

    @Column(name = "rating")
    private Integer rating; // Đánh giá từ học viên (1-5)

    @Column(name = "is_resolved")
    @Builder.Default
    private Boolean isResolved = false; // Đã được đánh dấu giải quyết chưa

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt; // Thời điểm đánh dấu giải quyết

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (status == DirectQuestionStatus.ANSWERED && respondedAt == null) {
            respondedAt = LocalDateTime.now();
        }
    }

    public enum DirectQuestionStatus {
        PENDING,      // Đang chờ TA
        ASSIGNED,    // Đã phân công TA
        ANSWERED,    // Đã trả lời
        CONVERTED    // Đã chuyển thành comment thường
    }
}
