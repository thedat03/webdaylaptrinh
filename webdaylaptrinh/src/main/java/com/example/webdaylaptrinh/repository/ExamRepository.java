package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.Exam;
import com.example.webdaylaptrinh.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExamRepository extends JpaRepository<Exam, UUID> {
    List<Exam> findByCourseAndPublishedTrue(Course course);

    Optional<Exam> findFirstByCourseAndPublishedTrueOrderByCreatedAtDesc(Course course);

    List<Exam> findByCourseAndCreatedBy(Course course, User user);
}

