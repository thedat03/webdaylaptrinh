package com.example.webdaylaptrinh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "lesson_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "lesson_id"})
})
public class LessonProgress {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(nullable = false)
    private Boolean isCompleted = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;

    // Video progress tracking
    @Column(name = "watched_seconds")
    private Integer watchedSeconds = 0; // Số giây đã xem video

    @Column(name = "watched_percentage")
    private Double watchedPercentage = 0.0; // Phần trăm đã xem (0-100)

    @PrePersist
    protected void onCreate() {
        if (lastAccessedAt == null) {
            lastAccessedAt = LocalDateTime.now();
        }
        if (isCompleted && completedAt == null) {
            completedAt = LocalDateTime.now();
        }
        if (watchedSeconds == null) {
            watchedSeconds = 0;
        }
        if (watchedPercentage == null) {
            watchedPercentage = 0.0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        lastAccessedAt = LocalDateTime.now();
        if (isCompleted && completedAt == null) {
            completedAt = LocalDateTime.now();
        }
    }
}

