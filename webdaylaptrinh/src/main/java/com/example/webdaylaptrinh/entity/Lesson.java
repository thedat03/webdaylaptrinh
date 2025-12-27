package com.example.webdaylaptrinh.entity;

import com.example.webdaylaptrinh.enums.LessonType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Lesson {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "lesson_id", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID lesson_id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id")
    @JsonIgnore
    private CourseModule module;

    private String title;

    @Enumerated(EnumType.STRING)
    private LessonType type;

    // Generic content fields that cover different lesson types
    private String contentUrl; // video/material link
    @Column(length = 10000)
    private String codeSnippet; // for code lessons
    @Column(length = 5000)
    private String description; // instructions/notes/homework description
    @Column(length = 10000)
    private String quizData; // JSON string for quiz questions and answers

    @Column(name = "position_index")
    private int position;

    // Duration in minutes
    private Integer durationMinutes;

    // Judge0 integration fields
    private Integer codeLanguageId; // Judge0 language ID

    @Column(length = 20000)
    private String codeTestCases; // JSON array of test cases
}


