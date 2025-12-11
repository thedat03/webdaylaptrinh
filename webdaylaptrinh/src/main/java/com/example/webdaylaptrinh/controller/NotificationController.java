package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.dto.ApiResponse;
import com.example.webdaylaptrinh.entity.Notification;
import com.example.webdaylaptrinh.security.UserPrincipal;
import com.example.webdaylaptrinh.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Lấy tất cả thông báo của user
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            UUID userId = userPrincipal.getId();

            List<Notification> notifications = notificationService.getUserNotifications(userId);
            return ResponseEntity.ok(new ApiResponse<>("Lấy danh sách thông báo thành công", notifications));
        } catch (Exception e) {
            log.error("Error getting notifications", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Lỗi khi lấy danh sách thông báo", null));
        }
    }

    /**
     * Đếm số thông báo chưa đọc
     */
    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            UUID userId = userPrincipal.getId();

            Long count = notificationService.getUnreadCount(userId);
            return ResponseEntity.ok(new ApiResponse<>("Lấy số thông báo chưa đọc thành công", count));
        } catch (Exception e) {
            log.error("Error getting unread count", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Lỗi khi lấy số thông báo chưa đọc", null));
        }
    }

    /**
     * Lấy thông báo chưa đọc
     */
    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<Notification>>> getUnreadNotifications(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            UUID userId = userPrincipal.getId();

            List<Notification> notifications = notificationService.getUnreadNotifications(userId);
            return ResponseEntity.ok(new ApiResponse<>("Lấy thông báo chưa đọc thành công", notifications));
        } catch (Exception e) {
            log.error("Error getting unread notifications", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Lỗi khi lấy thông báo chưa đọc", null));
        }
    }

    /**
     * Đánh dấu thông báo là đã đọc
     */
    @PostMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable UUID notificationId,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            UUID userId = userPrincipal.getId();

            notificationService.markAsRead(notificationId, userId);
            return ResponseEntity.ok(new ApiResponse<>("Đã đánh dấu đọc", null));
        } catch (Exception e) {
            log.error("Error marking notification as read", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Lỗi khi đánh dấu đọc", null));
        }
    }

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            UUID userId = userPrincipal.getId();

            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok(new ApiResponse<>("Đã đánh dấu tất cả là đã đọc", null));
        } catch (Exception e) {
            log.error("Error marking all notifications as read", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Lỗi khi đánh dấu tất cả là đã đọc", null));
        }
    }

    /**
     * Xóa thông báo
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @PathVariable UUID notificationId,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            UUID userId = userPrincipal.getId();

            notificationService.deleteNotification(notificationId, userId);
            return ResponseEntity.ok(new ApiResponse<>("Đã xóa thông báo", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error deleting notification", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Lỗi khi xóa thông báo", null));
        }
    }
}

