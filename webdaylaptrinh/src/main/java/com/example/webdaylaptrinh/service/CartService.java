package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.dto.CartResponse;
import com.example.webdaylaptrinh.entity.Cart;
import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.repository.CartRepository;
import com.example.webdaylaptrinh.repository.CourseRepository;
import com.example.webdaylaptrinh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LearningService learningService;

    @Transactional
    public CartResponse addToCart(UUID userId, UUID courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        // Check if user is already enrolled
        if (learningService.isUserEnrolled(user, course)) {
            throw new IllegalStateException("User already enrolled to this course");
        }

        // Check if already in cart
        Optional<Cart> existingCart = cartRepository.findByUserAndCourse(user, course);
        if (existingCart.isPresent()) {
            return convertToResponse(existingCart.get());
        }

        Cart cart = Cart.builder()
                .user(user)
                .course(course)
                .build();
        cart = cartRepository.save(cart);
        return convertToResponse(cart);
    }

    public List<CartResponse> getCartItems(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        List<Cart> carts = cartRepository.findAllByUser(user);
        return carts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public long getCartCount(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return cartRepository.countByUser(user);
    }

    @Transactional
    public void removeFromCart(UUID userId, UUID courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        cartRepository.deleteByUserAndCourse(user, course);
    }

    @Transactional
    public void clearCart(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        cartRepository.deleteAllByUser(user);
    }

    private CartResponse convertToResponse(Cart cart) {
        Course course = cart.getCourse();
        return CartResponse.builder()
                .id(cart.getId())
                .courseId(course.getCourse_id())
                .courseName(course.getCourse_name())
                .price(course.getPrice())
                .instructor(course.getInstructor())
                .description(course.getDescription())
                .pLink(course.getP_link())
                .createdAt(cart.getCreatedAt())
                .build();
    }
}

