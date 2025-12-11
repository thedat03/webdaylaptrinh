package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.config.VnPayProperties;
import com.example.webdaylaptrinh.dto.PaymentAdminView;
import com.example.webdaylaptrinh.dto.PaymentRequest;
import com.example.webdaylaptrinh.dto.PaymentStatusResponse;
import com.example.webdaylaptrinh.dto.PaymentUrlResponse;
import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.Payment;
import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.enums.PaymentStatus;
import com.example.webdaylaptrinh.repository.CourseRepository;
import com.example.webdaylaptrinh.repository.PaymentRepository;
import com.example.webdaylaptrinh.repository.UserRepository;
import com.example.webdaylaptrinh.util.VnPayUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private static final DateTimeFormatter VNP_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LearningService learningService;
    private final VnPayProperties vnPayProperties;
    private final NotificationService notificationService;

    public PaymentUrlResponse createPayment(PaymentRequest request, String clientIp) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (learningService.isUserEnrolled(user, course)) {
            throw new IllegalStateException("User already enrolled to this course");
        }

        long amount = course.getPrice();
        String txnRef = generateTxnRef();
        String locale = StringUtils.hasText(request.getLocale()) ? request.getLocale() : vnPayProperties.getLocale();
        String orderInfoRaw = String.format(Locale.ENGLISH, "Pay_%s_for_%s", user.getUsername(), course.getCourse_name());
        String orderInfo = sanitizeOrderInfo(orderInfoRaw);
        String createDate = LocalDateTime.now().format(VNP_DATE_FORMAT);
        String expireDate = LocalDateTime.now()
                .plusMinutes(Math.max(1, vnPayProperties.getExpireMinutes()))
                .format(VNP_DATE_FORMAT);

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", vnPayProperties.getVersion());
        params.put("vnp_Command", vnPayProperties.getCommand());
        params.put("vnp_TmnCode", vnPayProperties.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amount * 100));
        params.put("vnp_CurrCode", vnPayProperties.getCurrCode());
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", orderInfo);
        params.put("vnp_OrderType", vnPayProperties.getOrderType());
        params.put("vnp_Locale", locale);
        params.put("vnp_ReturnUrl", vnPayProperties.getReturnUrl());
        params.put("vnp_IpAddr", normalizeIp(clientIp));
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        if (StringUtils.hasText(request.getBankCode())) {
            params.put("vnp_BankCode", request.getBankCode());
        }

        // Build hash data & query string similar to official VNPay sample
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        boolean firstParam = true;
        for (String fieldName : fieldNames) {
            String fieldValue = params.get(fieldName);
            if (!StringUtils.hasText(fieldValue)) {
                continue;
            }

            if (!firstParam) {
                hashData.append('&');
                query.append('&');
            }

            // Hash data: key=URLEncoder(value) (key raw, value encoded)
            hashData.append(fieldName);
            hashData.append('=');
            hashData.append(encode(fieldValue));

            // Query string: URLEncoder(key)=URLEncoder(value)
            query.append(encode(fieldName));
            query.append('=');
            query.append(encode(fieldValue));

            firstParam = false;
        }

        String secureHash = VnPayUtils.hmacSHA512(vnPayProperties.getHashSecret(), hashData.toString());
        String paymentUrl = vnPayProperties.getPayUrl() + "?" + query + "&vnp_SecureHash=" + secureHash;

        Payment payment = Payment.builder()
                .user(user)
                .course(course)
                .amount(amount)
                .currency(vnPayProperties.getCurrCode())
                .txnRef(txnRef)
                .orderInfo(orderInfo)
                .orderType(vnPayProperties.getOrderType())
                .locale(locale)
                .bankCode(request.getBankCode())
                .ipAddress(clientIp)
                .status(PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);

        return PaymentUrlResponse.builder()
                .paymentUrl(paymentUrl)
                .txnRef(txnRef)
                .amount(amount)
                .build();
    }

    public PaymentStatusResponse handleReturn(Map<String, String> params) {
        PaymentStatusResponse response = processGatewayCallback(params);
        if (response == null) {
            return PaymentStatusResponse.builder()
                    .message("Invalid signature")
                    .status(PaymentStatus.FAILED)
                    .responseCode("97")
                    .txnRef(params.get("vnp_TxnRef"))
                    .build();
        }
        return response;
    }

    public Map<String, String> handleIpn(Map<String, String> rawParams) {
        if (!rawParams.containsKey("vnp_SecureHash")) {
            return Map.of("RspCode", "97", "Message", "Missing checksum");
        }
        Map<String, String> params = new HashMap<>(rawParams);
        String secureHash = params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        String hashData = buildSignedData(params);
        String signed = VnPayUtils.hmacSHA512(vnPayProperties.getHashSecret(), hashData);
        if (!VnPayUtils.secureCompare(secureHash, signed)) {
            return Map.of("RspCode", "97", "Message", "Invalid checksum");
        }

        String txnRef = params.get("vnp_TxnRef");
        Optional<Payment> optionalPayment = paymentRepository.findByTxnRef(txnRef);
        if (optionalPayment.isEmpty()) {
            return Map.of("RspCode", "01", "Message", "Order not found");
        }

        Payment payment = optionalPayment.get();
        if (payment.getStatus() == PaymentStatus.PAID) {
            return Map.of("RspCode", "02", "Message", "Order already confirmed");
        }

        PaymentStatus status = evaluateStatus(params.get("vnp_ResponseCode"), params.get("vnp_TransactionStatus"));
        updatePaymentFromCallback(payment, params, status);

        return Map.of("RspCode", "00", "Message", "Confirm Success");
    }

    public List<PaymentAdminView> getAllPayments() {
        return paymentRepository.findAdminPaymentViews();
    }

    public List<Payment> getUserPayments(User user) {
        return paymentRepository.findAllByUser(user);
    }

    private PaymentStatusResponse processGatewayCallback(Map<String, String> rawParams) {
        if (!rawParams.containsKey("vnp_SecureHash")) {
            return null;
        }
        Map<String, String> params = new HashMap<>(rawParams);
        String secureHash = params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        String hashData = buildSignedData(params);
        String signed = VnPayUtils.hmacSHA512(vnPayProperties.getHashSecret(), hashData);
        if (!VnPayUtils.secureCompare(secureHash, signed)) {
            log.warn("VNPay signature mismatch for txn {}", params.get("vnp_TxnRef"));
            return null;
        }

        String txnRef = params.get("vnp_TxnRef");
        Optional<Payment> optionalPayment = paymentRepository.findByTxnRef(txnRef);
        if (optionalPayment.isEmpty()) {
            log.warn("Payment not found for txn {}", txnRef);
            return PaymentStatusResponse.builder()
                    .message("Payment not found")
                    .status(PaymentStatus.FAILED)
                    .responseCode("01")
                    .txnRef(txnRef)
                    .build();
        }

        Payment payment = optionalPayment.get();
        PaymentStatus status = evaluateStatus(params.get("vnp_ResponseCode"), params.get("vnp_TransactionStatus"));
        updatePaymentFromCallback(payment, params, status);

        return PaymentStatusResponse.builder()
                .message(status == PaymentStatus.PAID ? "Payment success" : "Payment failed")
                .status(status)
                .responseCode(params.get("vnp_ResponseCode"))
                .txnRef(txnRef)
                .build();
    }

    private LocalDateTime parsePayDate(String payDate) {
        try {
            if (payDate == null) {
                return null;
            }
            return LocalDateTime.parse(payDate, VNP_DATE_FORMAT);
        } catch (Exception e) {
            log.warn("Could not parse pay date {}", payDate);
            return null;
        }
    }

    private String generateTxnRef() {
        return String.valueOf(System.currentTimeMillis());
    }

    private String sanitizeOrderInfo(String value) {
        if (value == null || value.isBlank()) {
            return "Payment";
        }
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        normalized = normalized.replaceAll("[^A-Za-z0-9 ]", " ");
        normalized = normalized.replaceAll("\\s+", " ").trim();
        return normalized.isEmpty() ? "Payment" : normalized;
    }

    private String normalizeIp(String ipAddress) {
        if (ipAddress == null || ipAddress.isBlank()) {
            return "1.54.42.155";
        }
        if (ipAddress.contains(":")) {
            return "1.54.42.155";
        }
        return ipAddress;
    }

    private String buildSignedData(Map<String, String> params) {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        boolean first = true;

        for (String fieldName : fieldNames) {
            String fieldValue = params.get(fieldName);
            if (!StringUtils.hasText(fieldValue)) {
                continue;
            }
            if (!first) {
                hashData.append('&');
            }
            hashData.append(fieldName);
            hashData.append('=');
            hashData.append(encode(fieldValue));
            first = false;
        }
        return hashData.toString();
    }

    private String encode(String value) {
        try {
            return URLEncoder.encode(value, StandardCharsets.US_ASCII.toString());
        } catch (UnsupportedEncodingException e) {
            throw new IllegalStateException("Unable to encode VNPay parameter", e);
        }
    }

    private PaymentStatus evaluateStatus(String responseCode, String transactionStatus) {
        return ("00".equals(responseCode) && "00".equals(transactionStatus))
                ? PaymentStatus.PAID
                : PaymentStatus.FAILED;
    }

    private void updatePaymentFromCallback(Payment payment, Map<String, String> params, PaymentStatus status) {
        payment.setTransactionStatus(params.get("vnp_TransactionStatus"));
        payment.setResponseCode(params.get("vnp_ResponseCode"));
        payment.setTransactionNo(params.get("vnp_TransactionNo"));
        payment.setPayDate(parsePayDate(params.get("vnp_PayDate")));

        if (status == PaymentStatus.PAID && payment.getStatus() != PaymentStatus.PAID) {
            payment.setStatus(PaymentStatus.PAID);
            paymentRepository.save(payment);
            try {
                learningService.enrollUserInCourse(payment.getUser(), payment.getCourse());
                // Tạo thông báo cho user, instructor và admin
                notificationService.notifyPaymentSuccess(payment);
            } catch (Exception e) {
                log.error("Enroll user after payment failed", e);
            }
        } else if (status == PaymentStatus.FAILED) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
        }
    }
}

