package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.TAReminder;
import com.example.webdaylaptrinh.entity.TAReminder.ReminderStatus;
import com.example.webdaylaptrinh.entity.TAReminder.ReminderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TAReminderRepository extends JpaRepository<TAReminder, UUID> {
    
    // Lấy tất cả nhắc nhở mà TA đã gửi (JOIN FETCH để load course và student)
    @Query("SELECT tr FROM TAReminder tr " +
           "LEFT JOIN FETCH tr.course " +
           "LEFT JOIN FETCH tr.student " +
           "LEFT JOIN FETCH tr.lesson " +
           "WHERE tr.ta.id = :taId ORDER BY tr.createdAt DESC")
    List<TAReminder> findByTaId(@Param("taId") UUID taId);
    
    // Lấy tất cả nhắc nhở của học viên
    @Query("SELECT tr FROM TAReminder tr WHERE tr.student.id = :studentId ORDER BY tr.createdAt DESC")
    List<TAReminder> findByStudentId(@Param("studentId") UUID studentId);
    
    // Lấy nhắc nhở theo khóa học
    @Query("SELECT tr FROM TAReminder tr WHERE tr.course.course_id = :courseId ORDER BY tr.createdAt DESC")
    List<TAReminder> findByCourseId(@Param("courseId") UUID courseId);
    
    // Lấy nhắc nhở theo loại
    @Query("SELECT tr FROM TAReminder tr WHERE tr.type = :type ORDER BY tr.createdAt DESC")
    List<TAReminder> findByType(@Param("type") ReminderType type);
    
    // Lấy nhắc nhở theo trạng thái
    @Query("SELECT tr FROM TAReminder tr WHERE tr.status = :status ORDER BY tr.createdAt DESC")
    List<TAReminder> findByStatus(@Param("status") ReminderStatus status);
}
