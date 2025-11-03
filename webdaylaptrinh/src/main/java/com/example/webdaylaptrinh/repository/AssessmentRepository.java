package com.example.webdaylaptrinh.repository;

import java.util.List;
import java.util.UUID;

import com.example.webdaylaptrinh.entity.Assessment;
import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;



public interface AssessmentRepository extends JpaRepository<Assessment, UUID> {

    List<Assessment> findByUserAndCourse(User user, Course course);

    List<Assessment> findByUser(User user);
}
