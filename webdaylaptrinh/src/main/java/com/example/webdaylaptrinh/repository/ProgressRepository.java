package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.Progress;
import com.example.webdaylaptrinh.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;



import java.util.UUID;

public interface ProgressRepository extends JpaRepository<Progress, UUID> {

    Progress findByUserAndCourse(User user, Course course);
}