package com.example.webdaylaptrinh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.UUID;

@Entity
@Table(name = "exam_submission_answers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"submission", "hibernateLazyInitializer", "handler"})
public class ExamSubmissionAnswer {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id")
    private ExamSubmission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private ExamQuestion question;

    // MCQ answer
    private String selectedOption;

    // Code answer
    @Column(length = 8000)
    private String codeAnswer;

    @Column(length = 4000)
    private String autoResult; // serialized test results for review

    private Double score = 0.0;
    private boolean passed = false;
}

