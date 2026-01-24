package com.example.webdaylaptrinh.entity;

import java.util.List;
import java.util.UUID;

import com.example.webdaylaptrinh.enums.CourseStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonGetter;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import jakarta.persistence.OrderBy;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties({"modules", "hibernateLazyInitializer", "handler"})
public class Course {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "course_id", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID course_id;

    @JsonProperty("course_name")
    private String course_name;

    private int price;

    private String instructor;

    private String description;

    @Column(length = 2000)
    private String learningOutcomes; // JSON array of learning outcomes strings

    private String p_link;

    private String y_link;

    /**
     * Người tạo khóa học (giảng viên). Dùng để phân quyền theo user.id.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password", "learningCourses", "createdAt", "updatedAt"})
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(length = 255)
    private String tags; // optional comma-separated labels

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourseStatus status = CourseStatus.PENDING; // Mặc định chờ duyệt


    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("position ASC")
    @JsonIgnore
    private List<CourseModule> modules;

    // Transient fields to store computed statistics (set by service before serialization)
    @Transient
    @JsonProperty("totalDurationMinutes")
    private Integer totalDurationMinutes;

    @Transient
    @JsonProperty("lessonsCount")
    private Integer lessonsCount;

    @Transient
    @JsonProperty("commentsCount")
    private Integer commentsCount;

    @Transient
    @JsonProperty("rating")
    private Double rating;

    // Số ngày kỳ vọng để hoàn thành khóa học (tính tự động hoặc set thủ công)
    @Column(name = "planned_days")
    private Integer plannedDays; // null = tự động tính

    // Methods to compute statistics (called by service)
    public void computeStatistics(List<Comment> comments) {
        // Compute lessons count
        if (modules != null) {
            this.lessonsCount = modules.stream()
                    .mapToInt(module -> module.getLessons() != null ? module.getLessons().size() : 0)
                    .sum();
            
            // Compute total duration from lessons
            this.totalDurationMinutes = modules.stream()
                    .flatMap(module -> module.getLessons() != null ? module.getLessons().stream() : java.util.stream.Stream.empty())
                    .mapToInt(lesson -> lesson.getDurationMinutes() != null ? lesson.getDurationMinutes() : 0)
                    .sum();
        } else {
            this.lessonsCount = 0;
            this.totalDurationMinutes = 0;
        }
        
        // Compute comments count (only approved comments for course, not replies)
        if (comments != null) {
            this.commentsCount = (int) comments.stream()
                    .filter(c -> c.getIsApproved() != null && c.getIsApproved() && c.getParentComment() == null)
                    .count();
            
            // Compute average rating from comments with rating
            List<Comment> ratedComments = comments.stream()
                    .filter(c -> c.getRating() != null && c.getRating() > 0 && c.getIsApproved() != null && c.getIsApproved())
                    .toList();
            
            if (!ratedComments.isEmpty()) {
                double sum = ratedComments.stream().mapToInt(Comment::getRating).sum();
                this.rating = sum / ratedComments.size();
            } else {
                this.rating = 0.0;
            }
        } else {
            this.commentsCount = 0;
            this.rating = 0.0;
        }
    }
}