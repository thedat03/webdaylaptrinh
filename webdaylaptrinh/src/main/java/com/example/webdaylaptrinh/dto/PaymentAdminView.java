package com.example.webdaylaptrinh.dto;

import com.example.webdaylaptrinh.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentAdminView {
    private UUID paymentId;
    private String txnRef;
    private PaymentStatus status;
    private long amount;
    private String currency;
    private LocalDateTime payDate;
    private LocalDateTime createdAt;
    private String bankCode;
    private String locale;
    private UUID userId;
    private String username;
    private String email;
    private UUID courseId;
    private String courseName;
}