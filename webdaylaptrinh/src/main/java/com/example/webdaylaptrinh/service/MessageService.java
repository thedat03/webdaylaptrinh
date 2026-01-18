package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.entity.Message;
import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.enums.UserRole;
import com.example.webdaylaptrinh.repository.MessageRepository;
import com.example.webdaylaptrinh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    /**
     * Tạo tin nhắn mới
     */
    @Transactional
    public Message createMessage(UUID senderId, UUID receiverId, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung tin nhắn không được để trống");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Người gửi không tồn tại"));
        
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Người nhận không tồn tại"));

        // Kiểm tra quyền chat dựa trên role
        validateChatPermission(sender, receiver);

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(content.trim())
                .isRead(false)
                .build();

        return messageRepository.save(message);
    }

    /**
     * Lấy cuộc trò chuyện giữa 2 người dùng
     */
    public List<Message> getConversation(UUID userId1, UUID userId2) {
        return messageRepository.findConversationBetweenUsers(userId1, userId2);
    }

    /**
     * Lấy danh sách người đã chat với user hiện tại
     */
    public List<User> getConversationPartners(UUID userId) {
        List<Message> messages = messageRepository.findAllMessagesByUser(userId);
        return messages.stream()
                .map(m -> m.getSender().getId().equals(userId) ? m.getReceiver() : m.getSender())
                .collect(Collectors.toMap(User::getId, user -> user, (existing, replacement) -> existing))
                .values()
                .stream()
                .collect(Collectors.toList());
    }

    /**
     * Đếm số tin nhắn chưa đọc
     */
    public Long getUnreadCount(UUID userId) {
        return messageRepository.countUnreadMessages(userId);
    }

    /**
     * Lấy tin nhắn chưa đọc
     */
    public List<Message> getUnreadMessages(UUID userId) {
        return messageRepository.findUnreadMessages(userId);
    }

    /**
     * Đánh dấu tin nhắn là đã đọc
     */
    @Transactional
    public void markAsRead(UUID userId, UUID senderId) {
        messageRepository.markMessagesAsRead(userId, senderId);
    }

    /**
     * Xóa tin nhắn (chỉ người gửi hoặc admin mới có quyền)
     */
    @Transactional
    public void deleteMessage(UUID messageId, UUID userId, UserRole userRole) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Tin nhắn không tồn tại"));

        // Chỉ người gửi hoặc admin mới có quyền xóa
        if (!message.getSender().getId().equals(userId) && userRole != UserRole.ADMIN) {
            throw new RuntimeException("Bạn không có quyền xóa tin nhắn này");
        }

        messageRepository.delete(message);
    }

    /**
     * Kiểm tra quyền chat dựa trên role
     * - STUDENT/USER có thể chat với INSTRUCTOR, TEACHING_ASSISTANT và ADMIN
     * - INSTRUCTOR có thể chat với STUDENT/USER và ADMIN
     * - TEACHING_ASSISTANT có thể chat với STUDENT/USER và ADMIN
     * - ADMIN có thể chat với tất cả
     */
    private void validateChatPermission(User sender, User receiver) {
        UserRole senderRole = sender.getRole();
        UserRole receiverRole = receiver.getRole();

        // Admin có thể chat với tất cả
        if (senderRole == UserRole.ADMIN || receiverRole == UserRole.ADMIN) {
            return;
        }

        // STUDENT/USER chỉ có thể chat với INSTRUCTOR, TEACHING_ASSISTANT hoặc ADMIN
        if (senderRole == UserRole.STUDENT || senderRole == UserRole.USER) {
            if (receiverRole != UserRole.INSTRUCTOR && receiverRole != UserRole.TEACHING_ASSISTANT && receiverRole != UserRole.ADMIN) {
                throw new RuntimeException("Học viên chỉ có thể chat với giáo viên, trợ giảng hoặc admin");
            }
        }

        // INSTRUCTOR chỉ có thể chat với STUDENT/USER hoặc ADMIN
        if (senderRole == UserRole.INSTRUCTOR) {
            if (receiverRole != UserRole.STUDENT && receiverRole != UserRole.USER && receiverRole != UserRole.ADMIN) {
                throw new RuntimeException("Giáo viên chỉ có thể chat với học viên hoặc admin");
            }
        }

        // TEACHING_ASSISTANT có thể chat với STUDENT/USER hoặc ADMIN
        if (senderRole == UserRole.TEACHING_ASSISTANT) {
            if (receiverRole != UserRole.STUDENT && receiverRole != UserRole.USER && receiverRole != UserRole.ADMIN) {
                throw new RuntimeException("Trợ giảng chỉ có thể chat với học viên hoặc admin");
            }
        }
    }

    /**
     * Lấy danh sách người dùng có thể chat (dựa trên role)
     */
    public List<User> getAvailableChatUsers(UUID currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        UserRole currentRole = currentUser.getRole();

        List<User> allUsers = userRepository.findAll();

        return allUsers.stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .filter(user -> {
                    UserRole userRole = user.getRole();
                    
                    // Admin có thể chat với tất cả
                    if (currentRole == UserRole.ADMIN) {
                        return true;
                    }
                    
                    // STUDENT chỉ thấy INSTRUCTOR, TEACHING_ASSISTANT và ADMIN
                    if (currentRole == UserRole.STUDENT || currentRole == UserRole.USER) {
                        return userRole == UserRole.INSTRUCTOR || userRole == UserRole.TEACHING_ASSISTANT || userRole == UserRole.ADMIN;
                    }
                    
                    // INSTRUCTOR chỉ thấy STUDENT và ADMIN
                    if (currentRole == UserRole.INSTRUCTOR) {
                        return userRole == UserRole.STUDENT || userRole == UserRole.USER || userRole == UserRole.ADMIN;
                    }
                    
                    // TEACHING_ASSISTANT chỉ thấy STUDENT và ADMIN
                    if (currentRole == UserRole.TEACHING_ASSISTANT) {
                        return userRole == UserRole.STUDENT || userRole == UserRole.USER || userRole == UserRole.ADMIN;
                    }
                    
                    return false;
                })
                .collect(Collectors.toList());
    }
}

