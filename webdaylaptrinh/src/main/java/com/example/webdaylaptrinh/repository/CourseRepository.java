package com.example.webdaylaptrinh.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.webdaylaptrinh.entity.Course;

import java.util.UUID;


public interface CourseRepository extends JpaRepository<Course, UUID> {
}
