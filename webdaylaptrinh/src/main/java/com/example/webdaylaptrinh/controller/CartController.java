package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.dto.CartRequest;
import com.example.webdaylaptrinh.dto.CartResponse;
import com.example.webdaylaptrinh.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping
    public ResponseEntity<CartResponse> addToCart(@RequestBody CartRequest request) {
        try {
            CartResponse response = cartService.addToCart(request.getUserId(), request.getCourseId());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CartResponse>> getCartItems(@PathVariable UUID userId) {
        try {
            List<CartResponse> items = cartService.getCartItems(userId);
            return ResponseEntity.ok(items);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/count/{userId}")
    public ResponseEntity<Long> getCartCount(@PathVariable UUID userId) {
        try {
            long count = cartService.getCartCount(userId);
            return ResponseEntity.ok(count);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/user/{userId}/course/{courseId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable UUID userId, @PathVariable UUID courseId) {
        try {
            cartService.removeFromCart(userId, courseId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> clearCart(@PathVariable UUID userId) {
        try {
            cartService.clearCart(userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

