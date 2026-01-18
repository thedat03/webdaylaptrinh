package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.service.TAProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ta-progress")
public class TAProgressController {

    @Autowired
    private TAProgressService progressService;

    @Autowired
    private com.example.webdaylaptrinh.repository.UserRepository userRepository;

    // Lấy tiến độ học của tất cả học viên trong khóa học
    @GetMapping("/course/{courseId}/students")
    @PreAuthorize("hasRole('TEACHING_ASSISTANT')")
    public ResponseEntity<?> getStudentsProgress(@PathVariable UUID courseId, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            UUID taId = getUserIdFromEmail(email);

            List<TAProgressService.StudentProgressDTO> progress = progressService.getStudentsProgressByCourse(taId, courseId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMap);
        }
    }

    // Lấy tiến độ học của một học viên cụ thể
    @GetMapping("/course/{courseId}/student/{studentId}")
    @PreAuthorize("hasRole('TEACHING_ASSISTANT')")
    public ResponseEntity<?> getStudentProgress(@PathVariable UUID courseId, @PathVariable UUID studentId, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            UUID taId = getUserIdFromEmail(email);

            TAProgressService.StudentProgressDTO progress = progressService.getStudentProgress(studentId, courseId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMap);
        }
    }

    // Lấy danh sách học viên cần nhắc nhở
    @GetMapping("/course/{courseId}/students-needing-reminder")
    @PreAuthorize("hasRole('TEACHING_ASSISTANT')")
    public ResponseEntity<?> getStudentsNeedingReminder(
            @PathVariable UUID courseId,
            @RequestParam(defaultValue = "7") int daysInactive,
            Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            UUID taId = getUserIdFromEmail(email);

            List<TAProgressService.StudentProgressDTO> students = progressService.getStudentsNeedingReminder(taId, courseId, daysInactive);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMap);
        }
    }

    // Lấy danh sách học viên trong khóa học (cho TA chọn khi gửi nhắc nhở) - chỉ trả về thông tin cơ bản
    @GetMapping("/course/{courseId}/students-list")
    @PreAuthorize("hasRole('TEACHING_ASSISTANT')")
    public ResponseEntity<?> getStudentsListInCourse(@PathVariable UUID courseId, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            UUID taId = getUserIdFromEmail(email);

            List<TAProgressService.StudentProgressDTO> students = progressService.getStudentsProgressByCourse(taId, courseId);
            // Chỉ trả về thông tin cơ bản của học viên
            List<Map<String, Object>> studentList = students.stream()
                    .map(s -> {
                        Map<String, Object> studentMap = new HashMap<>();
                        studentMap.put("id", s.getStudentId());
                        studentMap.put("name", s.getStudentName());
                        studentMap.put("email", s.getStudentEmail());
                        return studentMap;
                    })
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(studentList);
        } catch (Exception e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMap);
        }
    }

    // Lấy danh sách khóa học được phân công cho TA
    @GetMapping("/assigned-courses")
    @PreAuthorize("hasRole('TEACHING_ASSISTANT')")
    public ResponseEntity<?> getAssignedCourses(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            UUID taId = getUserIdFromEmail(email);

            List<com.example.webdaylaptrinh.entity.Course> courses = progressService.getAssignedCourses(taId);
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMap);
        }
    }

    private UUID getUserIdFromEmail(String email) {
        com.example.webdaylaptrinh.entity.User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return user.getId();
    }
}
