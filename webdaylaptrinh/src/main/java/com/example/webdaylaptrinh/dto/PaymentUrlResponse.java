package com.example.webdaylaptrinh.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class PaymentUrlResponse {
    private String paymentUrl;
    private String txnRef;
    private long amount;
}

