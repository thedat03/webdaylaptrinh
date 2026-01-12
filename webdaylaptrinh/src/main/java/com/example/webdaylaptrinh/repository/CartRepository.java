package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.Cart;
import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CartRepository extends JpaRepository<Cart, UUID> {
    List<Cart> findAllByUser(User user);
    Optional<Cart> findByUserAndCourse(User user, Course course);
    void deleteByUserAndCourse(User user, Course course);
    void deleteAllByUser(User user);
    long countByUser(User user);
}

