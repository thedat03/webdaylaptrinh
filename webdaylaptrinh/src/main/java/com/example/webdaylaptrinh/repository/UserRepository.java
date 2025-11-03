package com.example.webdaylaptrinh.repository;


import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;



import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    User findByEmail(String email);

    boolean existsByRole(UserRole role);

    User findByEmailAndPassword(String email, String password);
}