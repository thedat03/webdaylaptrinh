package com.example.webdaylaptrinh.dto;

import com.example.webdaylaptrinh.entity.User;
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
public class UserWithStatusDTO {
    private UUID id;
    private String username;
    private String email;
    private String mobileNumber;
    private String role;
    private Boolean isActive;
    private String dob;
    private String gender;
    private String location;
    private String profession;
    private String linkedin_url;
    private String github_url;
    private byte[] profileImage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastActiveAt;
    private Boolean isOnline;
    private Long offlineMinutes; // Số phút đã offline (null nếu đang online)

    public static UserWithStatusDTO fromUser(User user, boolean isOnline) {
        if (user == null) {
            return null;
        }

        UserWithStatusDTO dto = UserWithStatusDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .isActive(user.getIsActive())
                .dob(user.getDob())
                .gender(user.getGender())
                .location(user.getLocation())
                .profession(user.getProfession())
                .linkedin_url(user.getLinkedin_url())
                .github_url(user.getGithub_url())
                .profileImage(user.getProfileImage())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastActiveAt(user.getLastActiveAt())
                .isOnline(isOnline)
                .build();

        // Tính số phút đã offline nếu không online
        if (!isOnline && user.getLastActiveAt() != null) {
            LocalDateTime now = LocalDateTime.now();
            long minutes = java.time.Duration.between(user.getLastActiveAt(), now).toMinutes();
            dto.setOfflineMinutes(minutes);
        }

        return dto;
    }
}
