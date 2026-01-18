package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.TACourseAssignment;
import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.service.TACourseAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/ta-assignments")
public class TACourseAssignmentController {

    @Autowired
    private TACourseAssignmentService assignmentService;

    /**
     * Lấy tất cả phân công TA
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllAssignments() {
        try {
            List<TACourseAssignment> assignments = assignmentService.getAllAssignments();
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMap);
        }
    }

    /**
     * Lấy tất cả TA
     */
    @GetMapping("/tas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllTAs() {
        try {
            List<User> tas = assignmentService.getAllTAs();
            return ResponseEntity.ok(tas);
        } catch (Exception e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMap);
        }
    }

    /**
     * Lấy tất cả khóa học
     */
    @GetMapping("/courses")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllCourses() {
        try {
            List<Course> courses = assignmentService.getAllCourses();
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMap);
        }
    }

    /**
     * Phân công TA cho khóa học
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignTAToCourse(@RequestBody Map<String, Object> request) {
        try {
            String taIdStr = request.get("taId").toString();
            String courseIdStr = request.get("courseId").toString();
            
            UUID taId = UUID.fromString(taIdStr);
            UUID courseId = UUID.fromString(courseIdStr);

            TACourseAssignment assignment = assignmentService.assignTAToCourse(taId, courseId);
            return ResponseEntity.status(HttpStatus.CREATED).body(assignment);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", "Invalid UUID format");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMap);
        } catch (RuntimeException e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMap);
        } catch (Exception e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", "Failed to assign TA to course");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorMap);
        }
    }

    /**
     * Xóa phân công
     */
    @DeleteMapping("/{assignmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAssignment(@PathVariable UUID assignmentId) {
        try {
            assignmentService.deleteAssignment(assignmentId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMap);
        } catch (Exception e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", "Failed to delete assignment");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorMap);
        }
    }

    /**
     * Xóa phân công theo TA và Course
     */
    @DeleteMapping("/ta/{taId}/course/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeAssignment(@PathVariable UUID taId, @PathVariable UUID courseId) {
        try {
            assignmentService.removeAssignment(taId, courseId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMap);
        } catch (Exception e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", "Failed to remove assignment");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorMap);
        }
    }

    /**
     * Lấy phân công của một TA
     */
    @GetMapping("/ta/{taId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAssignmentsByTA(@PathVariable UUID taId) {
        try {
            List<TACourseAssignment> assignments = assignmentService.getAssignmentsByTA(taId);
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMap);
        }
    }

    /**
     * Lấy phân công của một khóa học
     */
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAssignmentsByCourse(@PathVariable UUID courseId) {
        try {
            List<TACourseAssignment> assignments = assignmentService.getAssignmentsByCourse(courseId);
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMap);
        }
    }
}
