package com.example.webdaylaptrinh.service;


import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.Category;
import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.enums.CourseStatus;
import com.example.webdaylaptrinh.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.ByteBuffer;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final LearningRepository learningRepository;
    private final PaymentRepository paymentRepository;
    private final CommentRepository commentRepository;
    private final ProgressRepository progressRepository;
    private final QuestionRepository questionRepository;
    private final AssessmentRepository assessmentRepository;
    private final DiscussionRepository discussionRepository;
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;
    private final NotificationService notificationService;

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
        // Chỉ trả về các khóa học đã được duyệt cho public
        List<Course> courses = courseRepository.findByStatus(CourseStatus.APPROVED);
        // Đảm bảo modules không được load để tránh circular reference
        courses.forEach(course -> {
            if (course.getModules() != null) {
                course.setModules(null);
            }
        });
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

    // Admin/Instructor có thể xem tất cả khóa học (bao gồm PENDING)
    public List<Course> getAllCoursesForAdmin() {
        List<Course> courses = courseRepository.findAll();
        courses.forEach(course -> {
            if (course.getModules() != null) {
                course.setModules(null);
            }
        });
        return courses;
    }

    public Course getCourseById(UUID id) {
        return courseRepository.findById(id).orElse(null);
    }

    public Course createCourse(Course course, UUID creatorUserId) {
        // If category is provided with category_id, load the Category entity
        if (course.getCategory() != null && course.getCategory().getCategory_id() != null) {
            Category cat = categoryRepository.findById(course.getCategory().getCategory_id()).orElse(null);
            course.setCategory(cat);
        }
        // Gắn user tạo khóa học (giảng viên) nếu có
        if (creatorUserId != null) {
            User creator = userRepository.findById(creatorUserId).orElse(null);
            course.setUser(creator);
            // Nếu chưa set instructor, dùng username của user để đồng bộ hiển thị
            if (creator != null && (course.getInstructor() == null || course.getInstructor().isBlank())) {
                course.setInstructor(creator.getUsername());
            }
        }
        // Mặc định status là PENDING khi tạo mới (trừ khi admin tạo thì có thể set APPROVED)
        if (course.getStatus() == null) {
            course.setStatus(CourseStatus.PENDING);
        }
        return courseRepository.save(course);
    }

    /**
     * Gán tất cả các khóa học cũ (chưa có user owner) cho một tài khoản cụ thể.
     * Dùng một lần để migrate dữ liệu cũ sang cơ chế phân quyền theo user.id.
     */
    @Transactional
    public int assignLegacyCoursesToUser(UUID userId) {
        User owner = userRepository.findById(userId).orElse(null);
        if (owner == null) {
            return 0;
        }
        List<Course> all = courseRepository.findAll();
        int count = 0;
        for (Course c : all) {
            if (c.getUser() == null) {
                c.setUser(owner);
                // Nếu instructor chưa có hoặc rỗng thì set luôn theo username cho đồng bộ hiển thị
                if (c.getInstructor() == null || c.getInstructor().isBlank()) {
                    c.setInstructor(owner.getUsername());
                }
                courseRepository.save(c);
                count++;
            }
        }
        return count;
    }

    @Transactional
    public Course updateCourse(UUID id, Course updatedCourse) {
        Course existingCourse = courseRepository.findById(id).orElse(null);
        if (existingCourse != null) {
            boolean nameChanged = updatedCourse.getCourse_name() != null && 
                                 !updatedCourse.getCourse_name().equals(existingCourse.getCourse_name());
            boolean descChanged = updatedCourse.getDescription() != null && 
                                 !updatedCourse.getDescription().equals(existingCourse.getDescription());
            
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
            Course savedCourse = courseRepository.save(existingCourse);
            
            // Thông báo cho học viên nếu có thay đổi quan trọng
            if (nameChanged || descChanged) {
                String updateMessage = nameChanged 
                    ? String.format("Tên khóa học đã được cập nhật thành \"%s\"", updatedCourse.getCourse_name())
                    : "Thông tin khóa học đã được cập nhật";
                notificationService.notifyCourseUpdate(savedCourse, updateMessage);
            }
            
            return savedCourse;
        }
        return null;
    }

    @Transactional
    public void deleteCourse(UUID id) {
        Course course = courseRepository.findById(id).orElse(null);
        if (course == null) {
            return; // Course doesn't exist, nothing to delete
        }

        // Delete all related records that have foreign key constraints
        // Order matters: delete child records before parent records
        
        // 1. Delete payment_orders records (native table without entity)
        // Convert UUID to byte array for BINARY(16) column in MySQL
        byte[] courseIdBytes = uuidToBytes(id);
        jdbcTemplate.update("DELETE FROM payment_orders WHERE course_id = ?", courseIdBytes);

        // 2. Delete Learning records
        learningRepository.deleteByCourseId(id);

        // 3. Delete Payment records
        paymentRepository.deleteByCourseId(id);

        // 4. Delete Comment records (including replies)
        commentRepository.deleteByCourseId(id);

        // 5. Delete Progress records
        progressRepository.deleteByCourseId(id);

        // 6. Delete Questions records
        questionRepository.deleteByCourseId(id);

        // 7. Delete Assessment records
        assessmentRepository.deleteByCourseId(id);

        // 8. Delete Discussion records
        discussionRepository.deleteByCourseId(id);

        // 9. Delete Feedback records (though cascade should handle this, being safe)
        feedbackRepository.deleteByCourseId(id);

        // Finally, delete the course itself
        // Modules and Lessons will be deleted automatically due to cascade = CascadeType.ALL
        courseRepository.deleteById(id);
    }

    public Course approveCourse(UUID courseId) {
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course != null) {
            course.setStatus(CourseStatus.APPROVED);
            return courseRepository.save(course);
        }
        return null;
    }

    public Course rejectCourse(UUID courseId) {
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course != null) {
            course.setStatus(CourseStatus.REJECTED);
            return courseRepository.save(course);
        }
        return null;
    }

    /**
     * Convert UUID to byte array for MySQL BINARY(16) column
     */
    private byte[] uuidToBytes(UUID uuid) {
        ByteBuffer bb = ByteBuffer.wrap(new byte[16]);
        bb.putLong(uuid.getMostSignificantBits());
        bb.putLong(uuid.getLeastSignificantBits());
        return bb.array();
    }
}