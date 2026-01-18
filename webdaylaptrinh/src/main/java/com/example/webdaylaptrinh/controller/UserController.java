package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.enums.UserRole;
import com.example.webdaylaptrinh.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> userData) {
        try {
            User user = new User();
            user.setUsername((String) userData.get("username"));
            user.setEmail((String) userData.get("email"));
            user.setPassword((String) userData.get("password"));
            user.setMobileNumber((String) userData.get("mobileNumber"));
            user.setDob((String) userData.get("dob"));
            user.setGender((String) userData.get("gender"));
            user.setLocation((String) userData.get("location"));
            user.setProfession((String) userData.get("profession"));
            user.setLinkedin_url((String) userData.get("linkedin_url"));
            user.setGithub_url((String) userData.get("github_url"));
            
            // Handle role conversion from string to enum
            Object roleObj = userData.get("role");
            if (roleObj != null) {
                String roleStr = roleObj.toString().trim();
                try {
                    // Try to match enum name (with or without ROLE_ prefix)
                    UserRole role;
                    if (roleStr.startsWith("ROLE_")) {
                        // Remove ROLE_ prefix and convert to enum name
                        String enumName = roleStr.substring(5); // Remove "ROLE_" prefix
                        role = UserRole.valueOf(enumName);
                    } else {
                        // Direct enum name match
                        role = UserRole.valueOf(roleStr);
                    }
                    user.setRole(role);
                } catch (IllegalArgumentException e) {
                    // If role string doesn't match enum, try to find by roleName
                    try {
                        // Try to find by roleName (e.g., "ROLE_TEACHING_ASSISTANT" -> TEACHING_ASSISTANT)
                        for (UserRole r : UserRole.values()) {
                            if (r.getRoleName().equals(roleStr)) {
                                user.setRole(r);
                                break;
                            }
                        }
                        // If still not found, default to USER
                        if (user.getRole() == null) {
                            user.setRole(UserRole.USER);
                        }
                    } catch (Exception ex) {
                        // Default to USER if all conversion fails
                        user.setRole(UserRole.USER);
                    }
                }
            } else {
                user.setRole(UserRole.USER);
            }
            
            // Handle isActive
            Object isActiveObj = userData.get("isActive");
            if (isActiveObj != null) {
                if (isActiveObj instanceof Boolean) {
                    user.setIsActive((Boolean) isActiveObj);
                } else if (isActiveObj instanceof String) {
                    user.setIsActive(Boolean.parseBoolean((String) isActiveObj));
                } else {
                    user.setIsActive(true);
                }
            } else {
                user.setIsActive(true);
            }
            
            User createdUser = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to create user"));
        }
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable UUID id) {
        return userService.getUserById(id);
    }

    @GetMapping("/{id}/profile-image")
    public ResponseEntity<byte[]> getProfileImage(@PathVariable UUID id) {
        User user = userService.getUserById(id);
        if (user == null || user.getProfileImage() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header("Content-Type", "image/jpeg")
                .body(user.getProfileImage());
    }

    @PostMapping("/{id}/upload-image")
    public ResponseEntity<String> uploadProfileImage(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        try {
            userService.updateUserProfile(file, id);
            return ResponseEntity.ok("Image uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error uploading image");
        }
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable UUID id, @RequestBody User updatedUser) {
        return userService.updateUser(id, updatedUser);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
    }

    @GetMapping("/details")
    public User getUserByEmail(@RequestParam String email) {
        return userService.getUserByEmail(email);
    }
}
