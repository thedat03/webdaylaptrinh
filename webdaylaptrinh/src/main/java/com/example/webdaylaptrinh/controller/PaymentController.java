package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.config.VnPayProperties;
import com.example.webdaylaptrinh.dto.CartPaymentRequest;
import com.example.webdaylaptrinh.dto.PaymentAdminView;
import com.example.webdaylaptrinh.dto.PaymentRequest;
import com.example.webdaylaptrinh.dto.PaymentStatusResponse;
import com.example.webdaylaptrinh.dto.PaymentUrlResponse;
import com.example.webdaylaptrinh.entity.Payment;
import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.service.PaymentService;
import com.example.webdaylaptrinh.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;
    private final VnPayProperties vnPayProperties;

    @PostMapping
    public PaymentUrlResponse createPayment(@RequestBody PaymentRequest request, HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        return paymentService.createPayment(request, clientIp);
    }

    @PostMapping("/cart")
    public PaymentUrlResponse createCartPayment(@RequestBody CartPaymentRequest request, HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        return paymentService.createCartPayment(request, clientIp);
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<?> vnPayReturn(@RequestParam Map<String, String> params) {
        PaymentStatusResponse response = paymentService.handleReturn(params);
        if (StringUtils.hasText(vnPayProperties.getFrontendReturn())) {
            URI redirectUri = UriComponentsBuilder.fromUriString(vnPayProperties.getFrontendReturn())
                    .queryParam("status", response.getStatus())
                    .queryParam("code", response.getResponseCode())
                    .queryParam("txnRef", response.getTxnRef())
                    .queryParam("message", response.getMessage())
                    .build()
                    .toUri();
            return ResponseEntity.status(HttpStatus.FOUND).location(redirectUri).build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vnpay-ipn")
    public Map<String, String> vnPayIpn(@RequestParam Map<String, String> params) {
        return paymentService.handleIpn(params);
    }

    @GetMapping
    public List<PaymentAdminView> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/user/{userId}")
    public List<Payment> getPaymentsByUser(@PathVariable UUID userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return paymentService.getUserPayments(user);
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

