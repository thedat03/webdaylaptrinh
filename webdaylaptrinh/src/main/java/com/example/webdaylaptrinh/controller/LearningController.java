package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.dto.EnrollRequest;
import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.Learning;
import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.service.LearningService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/learning")
public class LearningController {

    @Autowired
    private LearningService learningService;

    @GetMapping("/{userId}")
    public List<Course> getLearningCourses(@PathVariable UUID userId) {
        return learningService.getLearningCourses(userId);
    }

    @GetMapping
    public List<Learning> getEnrollments() {
        return learningService.getEnrollments();
    }

    @PostMapping
    public String enrollCourse(@RequestBody EnrollRequest enrollRequest) {
        return learningService.enrollCourse(enrollRequest);
    }

    @DeleteMapping("/{id}")
    public void unenrollCourse(@PathVariable UUID id) {
        learningService.unenrollCourse(id);
    }

    @GetMapping("/course/{courseId}")
    public List<Learning> getStudentsByCourse(@PathVariable UUID courseId) {
        return learningService.getStudentsByCourse(courseId);
    }

    @GetMapping("/check-access/{userId}/{courseId}")
    public Map<String, Boolean> checkCourseAccess(@PathVariable UUID userId, @PathVariable UUID courseId) {
        User user = learningService.getUserById(userId);
        Course course = learningService.getCourseById(courseId);
        boolean hasAccess = false;
        if (user != null && course != null) {
            hasAccess = learningService.isUserEnrolled(user, course);
        }
        Map<String, Boolean> result = new HashMap<>();
        result.put("hasAccess", hasAccess);
        return result;
    }
}
