package com.example.webdaylaptrinh.repository;

import java.util.List;
import java.util.UUID;

import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.Questions;
import org.springframework.data.jpa.repository.JpaRepository;



public interface QuestionRepository extends JpaRepository<Questions, UUID> {

    List<Questions> findByCourse(Course course);
}
