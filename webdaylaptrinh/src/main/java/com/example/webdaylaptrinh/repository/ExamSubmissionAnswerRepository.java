package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.ExamSubmission;
import com.example.webdaylaptrinh.entity.ExamSubmissionAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ExamSubmissionAnswerRepository extends JpaRepository<ExamSubmissionAnswer, UUID> {
    List<ExamSubmissionAnswer> findBySubmission(ExamSubmission submission);
}

