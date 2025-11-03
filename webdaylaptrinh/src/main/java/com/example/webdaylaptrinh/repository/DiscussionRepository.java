package com.example.webdaylaptrinh.repository;

import java.util.List;
import java.util.UUID;

import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.Discussion;
import org.springframework.data.jpa.repository.JpaRepository;



public interface DiscussionRepository extends JpaRepository<Discussion, UUID> {

    List<Discussion> findByCourse(Course course);
}