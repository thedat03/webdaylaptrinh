package com.example.webdaylaptrinh.controller;

import java.util.List;
import java.util.UUID;

import com.example.webdaylaptrinh.entity.Assessment;
import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.service.AssessmentService;
import com.example.webdaylaptrinh.service.CourseService;
import com.example.webdaylaptrinh.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    @Autowired
    private AssessmentService assessmentService;

    @Autowired
    private UserService userService;

    @Autowired
    private CourseService courseService;

    @GetMapping("/user/{userId}/course/{courseId}")
    public ResponseEntity<List<Assessment>> getAssessmentsByUserAndCourse(
            @PathVariable UUID userId,
            @PathVariable UUID courseId
    ) {
        User user = userService.getUserById(userId);
        Course course = courseService.getCourseById(courseId);

        List<Assessment> assessments = assessmentService.getAssessmentsByUserAndCourse(user, course);
        return ResponseEntity.ok(assessments);
    }

    @GetMapping("/performance/{userId}")
    public ResponseEntity<List<Assessment>> getAssessmentsByUser(@PathVariable UUID userId){
        User user = userService.getUserById(userId);
        return assessmentService.getAssessmentByUser(user);
    }

    @PostMapping("/add/{userId}/{courseId}")
    public ResponseEntity<Assessment> addAssessmentWithMarks(
            @PathVariable UUID userId,
            @PathVariable UUID courseId,
            @RequestBody Assessment assessment) {

        User user = userService.getUserById(userId);
        Course course = courseService.getCourseById(courseId);
        return assessmentService.saveAssessment(user , course, assessment);
    }
}
