package com.example.webdaylaptrinh.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity cho chức năng nhắc nhở học viên của TA
 */
@Entity
@Table(name = "ta_reminders")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TAReminder {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ta_id", nullable = false)
    @JsonIgnore
    private User ta; // TA gửi nhắc nhở

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student; // Học viên nhận nhắc nhở

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = true)
    @JsonIgnoreProperties({"modules", "feedbacks", "questions", "hibernateLazyInitializer", "handler", "user"})
    private Course course; // Khóa học liên quan

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = true)
    @JsonIgnore
    private Lesson lesson; // Bài học cụ thể (nếu nhắc về bài học)

    @Column(nullable = false, length = 1000)
    private String message; // Nội dung nhắc nhở

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ReminderType type = ReminderType.GENERAL; // Loại nhắc nhở

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ReminderStatus status = ReminderStatus.SENT; // Trạng thái

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt; // Thời điểm gửi

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (sentAt == null) {
            sentAt = LocalDateTime.now();
        }
    }

    public enum ReminderType {
        GENERAL,              // Nhắc nhở chung
        INACTIVE,             // Không học trong X ngày
        LESSON_NOT_COMPLETED, // Chưa hoàn thành bài học
        QUIZ_NOT_DONE,        // Chưa làm quiz
        EXAM_NOT_DONE         // Chưa làm đề thi
    }

    public enum ReminderStatus {
        SENT,      // Đã gửi
        READ,      // Đã đọc
        ACTED      // Đã thực hiện
    }
}
