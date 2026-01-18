package com.example.webdaylaptrinh.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity để quản lý TA được phép truy cập khóa học nào
 */
@Entity
@Table(name = "ta_course_assignments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"ta_id", "course_id"})
})
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TACourseAssignment {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ta_id", nullable = false)
    @JsonIgnoreProperties({"password", "learningCourses", "createdAt", "updatedAt"})
    private User ta; // Trợ giảng

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties({"user", "modules", "createdAt", "updatedAt"})
    private Course course;

    @CreatedDate
    @Column(name = "assigned_at", nullable = false, updatable = false)
    private LocalDateTime assignedAt;

    @PrePersist
    protected void onCreate() {
        if (assignedAt == null) {
            assignedAt = LocalDateTime.now();
        }
    }
}
