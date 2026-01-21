package com.example.webdaylaptrinh.dto;

import com.example.webdaylaptrinh.entity.Comment;
import com.example.webdaylaptrinh.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentWithStatusDTO {
    private UUID commentId;
    private UUID lessonId;
    private UUID courseId;
    private UUID exerciseId;
    private UserWithStatusDTO user;
    private String content;
    private Integer rating;
    private UUID parentCommentId;
    private List<CommentWithStatusDTO> replies;
    private Boolean isApproved;
    private Boolean isHidden;
    private Boolean isAnswered;
    private UserWithStatusDTO answeredByTa;
    private LocalDateTime answeredAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CommentWithStatusDTO fromComment(Comment comment, boolean isUserOnline, Long offlineMinutes) {
        if (comment == null) {
            return null;
        }

        CommentWithStatusDTO dto = CommentWithStatusDTO.builder()
                .commentId(comment.getCommentId())
                .lessonId(comment.getLesson() != null ? comment.getLesson().getLesson_id() : null)
                .courseId(comment.getCourse() != null ? comment.getCourse().getCourse_id() : null)
                .exerciseId(comment.getExercise() != null ? comment.getExercise().getExercise_id() : null)
                .user(comment.getUser() != null ? UserWithStatusDTO.fromUser(comment.getUser(), isUserOnline) : null)
                .content(comment.getContent())
                .rating(comment.getRating())
                .parentCommentId(comment.getParentComment() != null ? comment.getParentComment().getCommentId() : null)
                .isApproved(comment.getIsApproved())
                .isHidden(comment.getIsHidden())
                .isAnswered(comment.getIsAnswered())
                .answeredByTa(comment.getAnsweredByTa() != null ? 
                    UserWithStatusDTO.fromUser(comment.getAnsweredByTa(), false) : null) // TA status can be calculated separately if needed
                .answeredAt(comment.getAnsweredAt())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();

        // Set offline minutes if provided
        if (dto.getUser() != null && offlineMinutes != null) {
            dto.getUser().setOfflineMinutes(offlineMinutes);
        }

        // Recursively convert replies
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            dto.setReplies(comment.getReplies().stream()
                    .map(reply -> {
                        // Calculate online status for reply user
                        User replyUser = reply.getUser();
                        boolean replyUserOnline = false;
                        Long replyOfflineMinutes = null;
                        if (replyUser != null && replyUser.getLastActiveAt() != null) {
                            LocalDateTime now = LocalDateTime.now();
                            LocalDateTime fiveMinutesAgo = now.minusMinutes(5);
                            replyUserOnline = replyUser.getLastActiveAt().isAfter(fiveMinutesAgo);
                            if (!replyUserOnline) {
                                replyOfflineMinutes = java.time.Duration.between(replyUser.getLastActiveAt(), now).toMinutes();
                            }
                        }
                        return fromComment(reply, replyUserOnline, replyOfflineMinutes);
                    })
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}
