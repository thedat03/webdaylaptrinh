package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    
    // Lấy tất cả tin nhắn giữa 2 người dùng (cả 2 chiều)
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender.id = :userId1 AND m.receiver.id = :userId2) OR " +
           "(m.sender.id = :userId2 AND m.receiver.id = :userId1) " +
           "ORDER BY m.createdAt ASC")
    List<Message> findConversationBetweenUsers(@Param("userId1") UUID userId1, @Param("userId2") UUID userId2);
    
    // Lấy tất cả tin nhắn của user (để extract partners trong service)
    @Query("SELECT m FROM Message m WHERE m.sender.id = :userId OR m.receiver.id = :userId ORDER BY m.createdAt DESC")
    List<Message> findAllMessagesByUser(@Param("userId") UUID userId);
    
    // Đếm số tin nhắn chưa đọc của user
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.isRead = false")
    Long countUnreadMessages(@Param("userId") UUID userId);
    
    // Lấy tin nhắn chưa đọc của user
    @Query("SELECT m FROM Message m WHERE m.receiver.id = :userId AND m.isRead = false ORDER BY m.createdAt DESC")
    List<Message> findUnreadMessages(@Param("userId") UUID userId);
    
    // Đánh dấu tin nhắn là đã đọc
    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.isRead = true WHERE m.receiver.id = :userId AND m.sender.id = :senderId AND m.isRead = false")
    void markMessagesAsRead(@Param("userId") UUID userId, @Param("senderId") UUID senderId);
}

