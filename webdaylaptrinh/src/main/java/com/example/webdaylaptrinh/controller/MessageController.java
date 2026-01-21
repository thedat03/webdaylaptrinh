package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.dto.ApiResponse;
import com.example.webdaylaptrinh.dto.UserWithStatusDTO;
import com.example.webdaylaptrinh.entity.Message;
import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.enums.UserRole;
import com.example.webdaylaptrinh.repository.UserRepository;
import com.example.webdaylaptrinh.security.UserPrincipal;
import com.example.webdaylaptrinh.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Slf4j
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;

    /**
     * Gửi tin nhắn
     */
    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            UUID senderId = userPrincipal.getId();

            String receiverIdStr = request.get("receiverId").toString();
            UUID receiverId = UUID.fromString(receiverIdStr);
            String content = request.get("content").toString();

            Message message = messageService.createMessage(senderId, receiverId, content);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>("Tin nhắn đã được gửi", message));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(e.getMessage(), null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error sending message", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Lỗi khi gửi tin nhắn", null));
        }
    }

    /**
     * Lấy cuộc trò chuyện giữa 2 người dùng
     */
    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<ApiResponse<List<Message>>> getConversation(
            @PathVariable UUID otherUserId,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            UUID currentUserId = userPrincipal.getId();

            List<Message> messages = messageService.getConversation(currentUserId, otherUserId);
            return ResponseEntity.ok(new ApiResponse<>("Lấy cuộc trò chuyện thành công", messages));
        } catch (Exception e) {
            log.error("Error getting conversation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Lỗi khi lấy cuộc trò chuyện", null));
        }
    }

    /**
     * Lấy danh sách người đã chat
     */
    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<UserWithStatusDTO>>> getConversations(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            UUID userId = userPrincipal.getId();

            List<UserWithStatusDTO> partners = messageService.getConversationPartners(userId);
            return ResponseEntity.ok(new ApiResponse<>("Lấy danh sách cuộc trò chuyện thành công", partners));
        } catch (Exception e) {
            log.error("Error getting conversations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Lỗi khi lấy danh sách cuộc trò chuyện", null));
        }
    }

    /**
     * Lấy danh sách người dùng có thể chat
     */
    @GetMapping("/available-users")
    public ResponseEntity<ApiResponse<List<UserWithStatusDTO>>> getAvailableChatUsers(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            UUID userId = userPrincipal.getId();

            List<UserWithStatusDTO> users = messageService.getAvailableChatUsers(userId);
            return ResponseEntity.ok(new ApiResponse<>("Lấy danh sách người dùng thành công", users));
        } catch (Exception e) {
            log.error("Error getting available users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Lỗi khi lấy danh sách người dùng", null));
        }
    }

    /**
     * Đếm số tin nhắn chưa đọc
     */
    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            UUID userId = userPrincipal.getId();

            Long count = messageService.getUnreadCount(userId);
            return ResponseEntity.ok(new ApiResponse<>("Lấy số tin nhắn chưa đọc thành công", count));
        } catch (Exception e) {
            log.error("Error getting unread count", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Lỗi khi lấy số tin nhắn chưa đọc", null));
        }
    }

    /**
     * Lấy tin nhắn chưa đọc
     */
    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<Message>>> getUnreadMessages(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            UUID userId = userPrincipal.getId();

            List<Message> messages = messageService.getUnreadMessages(userId);
            return ResponseEntity.ok(new ApiResponse<>("Lấy tin nhắn chưa đọc thành công", messages));
        } catch (Exception e) {
            log.error("Error getting unread messages", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Lỗi khi lấy tin nhắn chưa đọc", null));
        }
    }

    /**
     * Đánh dấu tin nhắn là đã đọc
     */
    @PostMapping("/read/{senderId}")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable UUID senderId,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            UUID userId = userPrincipal.getId();

            messageService.markAsRead(userId, senderId);
            return ResponseEntity.ok(new ApiResponse<>("Đã đánh dấu đọc", null));
        } catch (Exception e) {
            log.error("Error marking messages as read", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Lỗi khi đánh dấu đọc", null));
        }
    }

    /**
     * Xóa tin nhắn
     */
    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @PathVariable UUID messageId,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            UUID userId = userPrincipal.getId();
            String authority = userPrincipal.getAuthorities().iterator().next().getAuthority();
            UserRole userRole = UserRole.valueOf(authority.replace("ROLE_", ""));

            messageService.deleteMessage(messageId, userId, userRole);
            return ResponseEntity.ok(new ApiResponse<>("Đã xóa tin nhắn", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error deleting message", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Lỗi khi xóa tin nhắn", null));
        }
    }
}

