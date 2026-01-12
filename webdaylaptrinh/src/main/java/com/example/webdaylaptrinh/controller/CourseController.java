package com.example.webdaylaptrinh.controller;

import java.util.List;
import java.util.UUID;

import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.security.UserPrincipal;
import com.example.webdaylaptrinh.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping
    public List<Course> getAllCourses(@RequestParam(value = "category", required = false) String category,
                                      @RequestParam(value = "free", required = false) Boolean free,
                                      @RequestParam(value = "admin", required = false) Boolean admin,
                                      @RequestParam(value = "search", required = false) String search) {
        // Nếu có search keyword, thực hiện tìm kiếm
        if (search != null && !search.trim().isEmpty()) {
            return courseService.searchCourses(search);
        }
        // Nếu là admin request, trả về tất cả khóa học (bao gồm PENDING)
        if (admin != null && admin) {
            return courseService.getAllCoursesForAdmin();
        }
        // Public chỉ thấy APPROVED courses
        return courseService.getAllCoursesFiltered(category, free);
    }

    @GetMapping("/{id}")
    public Course getCourseById(@PathVariable UUID id) {
        return courseService.getCourseById(id);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @PostMapping
    public Course createCourse(@org.springframework.security.core.annotation.AuthenticationPrincipal UserPrincipal principal,
                               @RequestBody Course course) {
        // Gắn user.id của giảng viên tạo khóa học để FE có thể phân quyền theo id
        return courseService.createCourse(course, principal != null ? principal.getId() : null);
    }

    /**
     * ADMIN: Gán tất cả các khóa học cũ (chưa có owner) cho một tài khoản cụ thể (theo userId).
     * Gọi một lần để migrate dữ liệu cũ sang user.id, sau đó cơ chế phân quyền theo id sẽ hoạt động đúng.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/legacy/assign/{userId}")
    public int assignLegacyCoursesToUser(@PathVariable UUID userId) {
        return courseService.assignLegacyCoursesToUser(userId);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @PutMapping("/{id}")
    public Course updateCourse(@PathVariable UUID id, @RequestBody Course updatedCourse) {
        return courseService.updateCourse(id, updatedCourse);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @DeleteMapping("/{id}")
    public void deleteCourse(@PathVariable UUID id) {
        courseService.deleteCourse(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/approve")
    public Course approveCourse(@PathVariable UUID id) {
        return courseService.approveCourse(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/reject")
    public Course rejectCourse(@PathVariable UUID id) {
        return courseService.rejectCourse(id);
    }
}
