package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.Learning;
import com.example.webdaylaptrinh.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;



import java.util.UUID;

public interface LearningRepository extends JpaRepository<Learning, UUID> {

    Learning findByUserAndCourse(User user, Course course);
}