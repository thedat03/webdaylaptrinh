package com.example.webdaylaptrinh.dto;

import com.example.webdaylaptrinh.entity.TAReminder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TAReminderDTO {
    private UUID id;
    private UserDTO ta;
    private UserDTO student;
    private CourseDTO course;
    private LessonDTO lesson;
    private String message;
    private String type;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDTO {
        private UUID id;
        private String username;
        private String email;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseDTO {
        private UUID course_id;
        private String course_name;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LessonDTO {
        private UUID lesson_id;
        private String title;
    }

    public static TAReminderDTO fromEntity(TAReminder reminder) {
        TAReminderDTO.TAReminderDTOBuilder builder = TAReminderDTO.builder()
                .id(reminder.getId())
                .message(reminder.getMessage())
                .type(reminder.getType() != null ? reminder.getType().name() : null)
                .status(reminder.getStatus() != null ? reminder.getStatus().name() : null)
                .createdAt(reminder.getCreatedAt())
                .sentAt(reminder.getSentAt());

        // TA info
        if (reminder.getTa() != null) {
            builder.ta(UserDTO.builder()
                    .id(reminder.getTa().getId())
                    .username(reminder.getTa().getUsername())
                    .email(reminder.getTa().getEmail())
                    .build());
        }

        // Student info
        if (reminder.getStudent() != null) {
            builder.student(UserDTO.builder()
                    .id(reminder.getStudent().getId())
                    .username(reminder.getStudent().getUsername())
                    .email(reminder.getStudent().getEmail())
                    .build());
        }

        // Course info (load if needed)
        if (reminder.getCourse() != null) {
            builder.course(CourseDTO.builder()
                    .course_id(reminder.getCourse().getCourse_id())
                    .course_name(reminder.getCourse().getCourse_name())
                    .build());
        }

        // Lesson info (load if needed)
        if (reminder.getLesson() != null) {
            builder.lesson(LessonDTO.builder()
                    .lesson_id(reminder.getLesson().getLesson_id())
                    .title(reminder.getLesson().getTitle())
                    .build());
        }

        return builder.build();
    }
}
