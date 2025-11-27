package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.CourseModule;
import com.example.webdaylaptrinh.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LessonRepository extends JpaRepository<Lesson, UUID> {
    List<Lesson> findByModuleOrderByPositionAsc(CourseModule module);
}


