package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.Exam;
import com.example.webdaylaptrinh.entity.ExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, UUID> {
    List<ExamQuestion> findByExamOrderByIdAsc(Exam exam);
    
    // Keep backward compatibility
    default List<ExamQuestion> findByExam(Exam exam) {
        return findByExamOrderByIdAsc(exam);
    }
}

