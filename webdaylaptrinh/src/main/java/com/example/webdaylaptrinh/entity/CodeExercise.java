package com.example.webdaylaptrinh.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

/**
 * Entity đại diện cho bài tập code riêng trong khóa học.
 * Khác với Lesson type CODE, CodeExercise là một tính năng độc lập cho phép giảng viên
 * tạo các bài tập code với tài liệu và test cases, tách biệt khỏi cấu trúc bài học.
 * 
 * @author System
 * @version 1.0
 */
@Entity
@Table(name = "code_exercises")
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties({"course", "hibernateLazyInitializer", "handler"})
public class CodeExercise {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "exercise_id", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID exercise_id;

    /**
     * Khóa học chứa bài tập này
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    @JsonIgnore
    private Course course;

    /**
     * Tiêu đề bài tập
     */
    @Column(nullable = false)
    private String title;

    /**
     * Mô tả/yêu cầu bài tập (có thể dùng Markdown)
     */
    @Column(length = 10000)
    private String description;

    /**
     * Tài liệu hướng dẫn chi tiết (Markdown format)
     */
    @Column(length = 20000)
    private String documentation;

    /**
     * Code snippet mẫu ban đầu (template code)
     */
    @Column(length = 10000)
    private String codeSnippet;

    /**
     * Judge0 language ID (ví dụ: 50 cho C++, 52 cho C, 71 cho Python)
     */
    @Column(name = "code_language_id")
    private Integer codeLanguageId;

    /**
     * Test cases dạng JSON array:
     * [
     *   {
     *     "name": "Test 1",
     *     "stdin": "input",
     *     "expectedOutput": "output",
     *     "hidden": false
     *   }
     * ]
     */
    @Column(length = 20000)
    private String codeTestCases;

    /**
     * Vị trí sắp xếp trong danh sách bài tập của khóa học
     */
    @Column(name = "position_index")
    private int position;

    /**
     * Thời gian ước tính hoàn thành (phút)
     */
    private Integer estimatedMinutes;
}
