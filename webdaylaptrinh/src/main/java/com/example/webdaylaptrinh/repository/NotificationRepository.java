package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    
    // Lấy tất cả thông báo của user, sắp xếp theo thời gian mới nhất
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    List<Notification> findAllByUserId(@Param("userId") UUID userId);
    
    // Đếm số thông báo chưa đọc của user
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.isRead = false")
    Long countUnreadNotifications(@Param("userId") UUID userId);
    
    // Lấy thông báo chưa đọc của user
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadNotifications(@Param("userId") UUID userId);
    
    // Đánh dấu thông báo là đã đọc
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.notificationId = :notificationId AND n.user.id = :userId")
    void markAsRead(@Param("notificationId") UUID notificationId, @Param("userId") UUID userId);
    
    // Đánh dấu tất cả thông báo của user là đã đọc
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
    void markAllAsRead(@Param("userId") UUID userId);
    
    // Xóa thông báo cũ hơn 30 ngày
    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate")
    void deleteOldNotifications(@Param("cutoffDate") java.time.LocalDateTime cutoffDate);
}

