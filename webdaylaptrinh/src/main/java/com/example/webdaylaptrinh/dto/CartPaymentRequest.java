package com.example.webdaylaptrinh.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartPaymentRequest {
    private UUID userId;
    private List<UUID> courseIds; // Multiple courses from cart
    private String bankCode;
    private String locale;
    private String promotionCode; // Mã khuyến mãi
}

