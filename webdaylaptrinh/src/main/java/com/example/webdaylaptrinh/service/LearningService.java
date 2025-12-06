package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.dto.EnrollRequest;
import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.Learning;
import com.example.webdaylaptrinh.entity.Progress;
import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.repository.CourseRepository;
import com.example.webdaylaptrinh.repository.LearningRepository;
import com.example.webdaylaptrinh.repository.ProgressRepository;
import com.example.webdaylaptrinh.repository.UserRepository;
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

    public List<Course> getLearningCourses(UUID userId) {
        Optional<User> optionalUser = userRepository.findById(userId);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            List<Course> learningCourses = new ArrayList<>();

            for (Learning learning : user.getLearningCourses()) {
                Course course = learning.getCourse();
                learningCourses.add(course);
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
        return learningRepository.findByUserAndCourse(user, course) != null;
    }

    public List<Learning> getStudentsByCourse(UUID courseId) {
        return learningRepository.findByCourse_CourseId(courseId);
    }
}
