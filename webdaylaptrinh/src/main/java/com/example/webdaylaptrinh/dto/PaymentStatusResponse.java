package com.example.webdaylaptrinh.dto;

import com.example.webdaylaptrinh.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentStatusResponse {
    private String message;
    private String responseCode;
    private PaymentStatus status;
    private String txnRef;
}

