package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.TACourseAssignment;
import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.enums.UserRole;
import com.example.webdaylaptrinh.repository.CourseRepository;
import com.example.webdaylaptrinh.repository.TACourseAssignmentRepository;
import com.example.webdaylaptrinh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TACourseAssignmentService {

    private final TACourseAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    /**
     * Lấy tất cả phân công TA
     */
    public List<TACourseAssignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    /**
     * Lấy tất cả TA (người dùng có role TEACHING_ASSISTANT)
     */
    public List<User> getAllTAs() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == UserRole.TEACHING_ASSISTANT)
                .toList();
    }

    /**
     * Lấy tất cả khóa học
     */
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    /**
     * Phân công TA cho khóa học
     */
    @Transactional
    public TACourseAssignment assignTAToCourse(UUID taId, UUID courseId) {
        // Kiểm tra TA có tồn tại và có role đúng không
        User ta = userRepository.findById(taId)
                .orElseThrow(() -> new RuntimeException("TA not found"));
        
        if (ta.getRole() != UserRole.TEACHING_ASSISTANT) {
            throw new RuntimeException("User is not a Teaching Assistant");
        }

        // Kiểm tra khóa học có tồn tại không
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Kiểm tra đã phân công chưa
        if (assignmentRepository.findByTaIdAndCourseId(taId, courseId).isPresent()) {
            throw new RuntimeException("TA already assigned to this course");
        }

        // Tạo assignment mới
        TACourseAssignment assignment = new TACourseAssignment();
        assignment.setTa(ta);
        assignment.setCourse(course);

        return assignmentRepository.save(assignment);
    }

    /**
     * Xóa phân công TA khỏi khóa học
     */
    @Transactional
    public void removeAssignment(UUID taId, UUID courseId) {
        TACourseAssignment assignment = assignmentRepository.findByTaIdAndCourseId(taId, courseId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        
        assignmentRepository.delete(assignment);
    }

    /**
     * Xóa phân công theo ID
     */
    @Transactional
    public void deleteAssignment(UUID assignmentId) {
        TACourseAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        
        assignmentRepository.delete(assignment);
    }

    /**
     * Lấy tất cả phân công của một TA
     */
    public List<TACourseAssignment> getAssignmentsByTA(UUID taId) {
        return assignmentRepository.findByTaId(taId);
    }

    /**
     * Lấy tất cả phân công của một khóa học
     */
    public List<TACourseAssignment> getAssignmentsByCourse(UUID courseId) {
        return assignmentRepository.findByCourseId(courseId);
    }
}
