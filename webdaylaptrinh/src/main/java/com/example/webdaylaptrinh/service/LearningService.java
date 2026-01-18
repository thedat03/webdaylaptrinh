package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.dto.EnrollRequest;
import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.Learning;
import com.example.webdaylaptrinh.entity.Progress;
import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.enums.UserRole;
import com.example.webdaylaptrinh.repository.CourseRepository;
import com.example.webdaylaptrinh.repository.LearningRepository;
import com.example.webdaylaptrinh.repository.ProgressRepository;
import com.example.webdaylaptrinh.repository.UserRepository;
import com.example.webdaylaptrinh.repository.TACourseAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@RequiredArgsConstructor
@Service
public class LearningService {

    private final LearningRepository learningRepository;

    private final UserRepository userRepository;

    private final CourseRepository courseRepository;

    private final ProgressRepository progressRepository;
    
    private final TACourseAssignmentRepository taCourseAssignmentRepository;

    public List<Course> getLearningCourses(UUID userId) {
        Optional<User> optionalUser = userRepository.findById(userId);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            List<Course> learningCourses = new ArrayList<>();

            // Lấy các khóa học đã đăng ký
            for (Learning learning : user.getLearningCourses()) {
                Course course = learning.getCourse();
                learningCourses.add(course);
            }

            // Nếu là TA, thêm các khóa học được phân công
            if (user.getRole() == UserRole.TEACHING_ASSISTANT) {
                List<com.example.webdaylaptrinh.entity.TACourseAssignment> assignments = 
                    taCourseAssignmentRepository.findByTaId(userId);
                for (com.example.webdaylaptrinh.entity.TACourseAssignment assignment : assignments) {
                    Course course = assignment.getCourse();
                    // Chỉ thêm nếu chưa có trong danh sách
                    if (!learningCourses.stream().anyMatch(c -> c.getCourse_id().equals(course.getCourse_id()))) {
                        learningCourses.add(course);
                    }
                }
            }

            return learningCourses;
        }

        return null;
    }

    public List<Learning> getEnrollments() {
        return learningRepository.findAll();
    }

    public String enrollCourse(EnrollRequest enrollRequest) {
        User user = userRepository.findById(enrollRequest.getUserId()).orElse(null);
        Course course = courseRepository.findById(enrollRequest.getCourseId()).orElse(null);

        if (user != null && course != null) {
            Learning learning = enrollUserInCourse(user, course);
            if (learning != null) {
                return "Enrolled successfully";
            }
            return "Course already enrolled";
        }

        return "Failed to enroll";
    }


    public void unenrollCourse(UUID id) {
        learningRepository.deleteById(id);
    }

    public Learning enrollUserInCourse(User user, Course course) {
        Learning existingLearning = learningRepository.findByUserAndCourse(user, course);
        if (existingLearning != null) {
            return null;
        }

        Progress progress = new Progress();
        progress.setUser(user);
        progress.setCourse(course);
        progressRepository.save(progress);

        Learning learning = new Learning();
        learning.setUser(user);
        learning.setCourse(course);
        return learningRepository.save(learning);
    }

    public boolean isUserEnrolled(User user, Course course) {
        // Kiểm tra đã đăng ký thông thường
        if (learningRepository.findByUserAndCourse(user, course) != null) {
            return true;
        }
        
        // Nếu là TA, kiểm tra có được phân công không
        if (user.getRole() == UserRole.TEACHING_ASSISTANT) {
            return taCourseAssignmentRepository.findByTaIdAndCourseId(user.getId(), course.getCourse_id())
                    .isPresent();
        }
        
        return false;
    }

    public List<Learning> getStudentsByCourse(UUID courseId) {
        return learningRepository.findByCourse_CourseId(courseId);
    }

    public User getUserById(UUID userId) {
        return userRepository.findById(userId).orElse(null);
    }

    public Course getCourseById(UUID courseId) {
        return courseRepository.findById(courseId).orElse(null);
    }
}
