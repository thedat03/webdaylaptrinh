package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.Exam;
import com.example.webdaylaptrinh.entity.ExamSubmission;
import com.example.webdaylaptrinh.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExamSubmissionRepository extends JpaRepository<ExamSubmission, UUID> {
    List<ExamSubmission> findByExam(Exam exam);
    List<ExamSubmission> findByExamAndUser(Exam exam, User user);
    
    @EntityGraph(attributePaths = {"answers", "answers.question"})
    List<ExamSubmission> findByExamAndUserOrderBySubmittedAtDesc(Exam exam, User user);
    
    @EntityGraph(attributePaths = {"answers", "answers.question"})
    Optional<ExamSubmission> findTopByExamAndUserOrderBySubmittedAtDesc(Exam exam, User user);
    
    @EntityGraph(attributePaths = {"answers", "answers.question"})
    Optional<ExamSubmission> findById(UUID id);
}

