package com.example.webdaylaptrinh.entity;

import com.example.webdaylaptrinh.enums.QuestionType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "exam_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"exam", "hibernateLazyInitializer", "handler"})
public class ExamQuestion {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id")
    private Exam exam;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type = QuestionType.MCQ;

    /**
     * Nội dung câu hỏi hoặc đề bài code.
     */
    @Column(length = 2000)
    private String prompt;

    // MCQ fields
    private String option1;
    private String option2;
    private String option3;
    private String option4;
    private String answer;

    // Code fields
    private Integer languageId; // Judge0 language id

    @Column(length = 4000)
    private String starterCode;

    @Column(length = 8000)
    private String testCases; // JSON array of CodeTestCase

    @Column(nullable = false)
    private Double maxScore = 1.0;
}

