package com.example.webdaylaptrinh.enums;

import lombok.Getter;

@Getter
public enum UserRole {

    USER("ROLE_USER"),
    STUDENT("ROLE_STUDENT"),
    ADMIN("ROLE_ADMIN"),
    INSTRUCTOR("ROLE_INSTRUCTOR"),
    TEACHING_ASSISTANT("ROLE_TEACHING_ASSISTANT");

    private final String roleName;

    UserRole(String roleName) {
        this.roleName = roleName;
    }
}