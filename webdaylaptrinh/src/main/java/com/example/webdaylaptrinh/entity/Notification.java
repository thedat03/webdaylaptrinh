package com.example.webdaylaptrinh.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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

@Entity
@Table(name = "notifications")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "notification_id", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID notificationId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "learningCourses", "createdAt", "updatedAt"})
    private User user;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(length = 50)
    private String type; // PAYMENT_SUCCESS, PROMOTION, COMPETITION, COURSE_ENROLLMENT, etc.

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "related_id", columnDefinition = "BINARY(16)")
    private UUID relatedId; // ID của course, payment, etc. liên quan

    @Column(name = "related_type", length = 50)
    private String relatedType; // COURSE, PAYMENT, etc.

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
        if (isRead == null) {
            isRead = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

