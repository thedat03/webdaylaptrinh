package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.entity.TAReminder;
import com.example.webdaylaptrinh.entity.TAReminder.ReminderType;
import com.example.webdaylaptrinh.service.TAReminderService;
import org.springframework.beans.factory.annotation.Autowired;
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
@RequestMapping("/api/ta-reminders")
public class TAReminderController {

    @Autowired
    private TAReminderService reminderService;

    @Autowired
    private com.example.webdaylaptrinh.repository.UserRepository userRepository;

    // TA gửi nhắc nhở cho học viên
    @PostMapping
    @PreAuthorize("hasRole('TEACHING_ASSISTANT')")
    public ResponseEntity<?> sendReminder(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            UUID taId = getUserIdFromEmail(email);

            UUID studentId = UUID.fromString(request.get("studentId").toString());
            String message = request.get("message").toString();
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Message is required"));
            }

            ReminderType type = ReminderType.GENERAL;
            if (request.get("type") != null) {
                try {
                    type = ReminderType.valueOf(request.get("type").toString().toUpperCase());
                } catch (IllegalArgumentException e) {
                    // Giữ mặc định GENERAL
                }
            }

            UUID courseId = null;
            if (request.get("courseId") != null) {
                courseId = UUID.fromString(request.get("courseId").toString());
            }

            UUID lessonId = null;
            if (request.get("lessonId") != null) {
                lessonId = UUID.fromString(request.get("lessonId").toString());
            }

            TAReminder reminder = reminderService.sendReminder(taId, studentId, message, type, courseId, lessonId);
            return ResponseEntity.status(HttpStatus.CREATED).body(reminder);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Lấy tất cả nhắc nhở mà TA đã gửi
    @GetMapping("/ta/my-reminders")
    @PreAuthorize("hasRole('TEACHING_ASSISTANT')")
    public ResponseEntity<List<TAReminder>> getMyReminders(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            UUID taId = getUserIdFromEmail(email);

            List<TAReminder> reminders = reminderService.getTAReminders(taId);
            return ResponseEntity.ok(reminders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Lấy tất cả nhắc nhở của học viên
    @GetMapping("/my-reminders")
    @PreAuthorize("hasAnyRole('USER', 'STUDENT', 'TEACHING_ASSISTANT')")
    public ResponseEntity<List<TAReminder>> getMyStudentReminders(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            UUID studentId = getUserIdFromEmail(email);

            List<TAReminder> reminders = reminderService.getStudentReminders(studentId);
            return ResponseEntity.ok(reminders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Đánh dấu nhắc nhở đã đọc
    @PutMapping("/{reminderId}/read")
    @PreAuthorize("hasAnyRole('USER', 'STUDENT', 'TEACHING_ASSISTANT')")
    public ResponseEntity<TAReminder> markAsRead(@PathVariable UUID reminderId) {
        try {
            TAReminder reminder = reminderService.markAsRead(reminderId);
            return ResponseEntity.ok(reminder);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    private UUID getUserIdFromEmail(String email) {
        com.example.webdaylaptrinh.entity.User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return user.getId();
    }
}
