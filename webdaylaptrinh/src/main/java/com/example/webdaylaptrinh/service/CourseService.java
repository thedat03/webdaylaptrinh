package com.example.webdaylaptrinh.service;


import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.Category;
import com.example.webdaylaptrinh.repository.CourseRepository;
import com.example.webdaylaptrinh.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;

    public List<Course> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        // Đảm bảo modules không được load để tránh circular reference
        courses.forEach(course -> {
            if (course.getModules() != null) {
                course.setModules(null);
            }
        });
        return courses;
    }

    public List<Course> getAllCoursesFiltered(String categoryId, Boolean free) {
        List<Course> courses = getAllCourses();
        if (categoryId != null && !categoryId.isBlank()) {
            try {
                UUID catId = UUID.fromString(categoryId);
                courses = courses.stream().filter(c -> c.getCategory() != null && c.getCategory().getCategory_id().equals(catId)).toList();
            } catch (IllegalArgumentException e) {
                // Invalid UUID, return empty
                return List.of();
            }
        }
        if (free != null && free) {
            courses = courses.stream().filter(c -> c.getPrice() == 0).toList();
        }
        return courses;
    }

    public Course getCourseById(UUID id) {
        return courseRepository.findById(id).orElse(null);
    }

    public Course createCourse(Course course) {
        // If category is provided with category_id, load the Category entity
        if (course.getCategory() != null && course.getCategory().getCategory_id() != null) {
            Category cat = categoryRepository.findById(course.getCategory().getCategory_id()).orElse(null);
            course.setCategory(cat);
        }
        return courseRepository.save(course);
    }

    public Course updateCourse(UUID id, Course updatedCourse) {
        Course existingCourse = courseRepository.findById(id).orElse(null);
        if (existingCourse != null) {
            existingCourse.setCourse_name(updatedCourse.getCourse_name());
            existingCourse.setDescription(updatedCourse.getDescription());
            existingCourse.setP_link(updatedCourse.getP_link());
            existingCourse.setPrice(updatedCourse.getPrice());
            existingCourse.setInstructor(updatedCourse.getInstructor());
            existingCourse.setY_link(updatedCourse.getY_link());
            existingCourse.setTags(updatedCourse.getTags());
            // Handle category: if provided with category_id, load the Category entity
            if (updatedCourse.getCategory() != null && updatedCourse.getCategory().getCategory_id() != null) {
                Category cat = categoryRepository.findById(updatedCourse.getCategory().getCategory_id()).orElse(null);
                existingCourse.setCategory(cat);
            } else {
                existingCourse.setCategory(null);
            }
            return courseRepository.save(existingCourse);
        }
        return null;
    }

    public void deleteCourse(UUID id) {
        courseRepository.deleteById(id);
    }
}