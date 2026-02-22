package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.config.VnPayProperties;
import com.example.webdaylaptrinh.dto.CartPaymentRequest;
import com.example.webdaylaptrinh.dto.InstructorCourseRevenueDto;
import com.example.webdaylaptrinh.dto.InstructorRevenueDetailDto;
import com.example.webdaylaptrinh.dto.InstructorRevenueDto;
import com.example.webdaylaptrinh.dto.InstructorRevenuePointDto;
import com.example.webdaylaptrinh.dto.PaymentAdminView;
import com.example.webdaylaptrinh.dto.PaymentRequest;
import com.example.webdaylaptrinh.dto.PaymentStatusResponse;
import com.example.webdaylaptrinh.dto.PaymentUrlResponse;
import com.example.webdaylaptrinh.entity.Course;
import com.example.webdaylaptrinh.entity.Payment;
import com.example.webdaylaptrinh.entity.PaymentCourse;
import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.enums.PaymentStatus;
import com.example.webdaylaptrinh.entity.Promotion;
import com.example.webdaylaptrinh.repository.CourseRepository;
import com.example.webdaylaptrinh.repository.PaymentCourseRepository;
import com.example.webdaylaptrinh.repository.PaymentRepository;
import com.example.webdaylaptrinh.repository.UserRepository;
import com.example.webdaylaptrinh.service.PromotionService;
import com.example.webdaylaptrinh.util.VnPayUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private static final DateTimeFormatter VNP_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final PaymentRepository paymentRepository;
    private final PaymentCourseRepository paymentCourseRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LearningService learningService;
    private final PromotionService promotionService;
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

    public InstructorRevenueDto getInstructorRevenue(UUID instructorId) {
        long revenueFromSingle = paymentRepository.sumRevenueByInstructorSingle(instructorId, PaymentStatus.PAID);
        long revenueFromCart = paymentCourseRepository.sumRevenueByInstructor(instructorId, PaymentStatus.PAID);
        long totalRevenue = revenueFromSingle + revenueFromCart;

        long coursesSoldFromSingle = paymentRepository.countPaymentsByInstructorSingle(instructorId, PaymentStatus.PAID);
        long coursesSoldFromCart = paymentCourseRepository.countCoursesSoldByInstructor(instructorId, PaymentStatus.PAID);
        long totalCoursesSold = coursesSoldFromSingle + coursesSoldFromCart;

        long paymentsFromSingle = coursesSoldFromSingle;
        long paymentsFromCart = paymentCourseRepository.countPaymentsByInstructor(instructorId, PaymentStatus.PAID);
        long totalPayments = paymentsFromSingle + paymentsFromCart;

        return new InstructorRevenueDto(totalRevenue, totalCoursesSold, totalPayments);
    }

    public InstructorRevenueDetailDto getInstructorRevenueDetail(UUID instructorId) {
        return getInstructorRevenueDetail(instructorId, null, null, "month");
    }

    public InstructorRevenueDetailDto getInstructorRevenueDetail(UUID instructorId, String fromDate, String toDate, String groupBy) {
        LocalDate from = parseDate(fromDate);
        LocalDate to = parseDate(toDate);
        String normalizedGroupBy = "day".equalsIgnoreCase(groupBy) ? "day" : "month";

        List<PaymentCourse> paidCourseItems = paymentCourseRepository.findPaidByInstructorId(instructorId, PaymentStatus.PAID);
        List<Payment> paidSinglePayments = paymentRepository.findPaidSingleByInstructorId(instructorId, PaymentStatus.PAID);

        Map<UUID, InstructorCourseRevenueDto> courseMap = new LinkedHashMap<>();
        Map<YearMonth, Long> revenueByMonth = new HashMap<>();
        Map<LocalDate, Long> revenueByDay = new HashMap<>();
        Set<UUID> paymentIds = new HashSet<>();

        Map<UUID, List<PaymentCourse>> itemsByPayment = new HashMap<>();
        for (PaymentCourse pc : paidCourseItems) {
            if (pc.getPayment() == null || pc.getCourse() == null) {
                continue;
            }
            itemsByPayment.computeIfAbsent(pc.getPayment().getId(), k -> new ArrayList<>()).add(pc);
        }

        for (List<PaymentCourse> items : itemsByPayment.values()) {
            Payment payment = items.get(0).getPayment();
            if (payment == null) continue;

            paymentIds.add(payment.getId());
            long totalPrice = items.stream().mapToLong(pc -> pc.getCourse().getPrice()).sum();
            long remaining = payment.getAmount();
            LocalDateTime soldAt = getPaymentDate(payment);
            if (!isInRange(soldAt, from, to)) {
                continue;
            }

            for (int i = 0; i < items.size(); i++) {
                PaymentCourse pc = items.get(i);
                Course course = pc.getCourse();
                if (course == null) continue;
                long allocated;
                if (i == items.size() - 1) {
                    allocated = remaining;
                } else if (totalPrice > 0) {
                    allocated = Math.round((double) course.getPrice() / (double) totalPrice * payment.getAmount());
                    remaining -= allocated;
                } else {
                    allocated = 0;
                }

                updateCourseRevenue(courseMap, course, allocated, soldAt);
                accumulateByPeriod(revenueByMonth, revenueByDay, soldAt, allocated);
            }
        }

        for (Payment payment : paidSinglePayments) {
            Course course = payment.getCourse();
            if (course == null) continue;

            LocalDateTime soldAt = getPaymentDate(payment);
            if (!isInRange(soldAt, from, to)) {
                continue;
            }

            paymentIds.add(payment.getId());
            long amount = payment.getAmount();
            updateCourseRevenue(courseMap, course, amount, soldAt);
            accumulateByPeriod(revenueByMonth, revenueByDay, soldAt, amount);
        }

        long totalRevenue = courseMap.values().stream().mapToLong(InstructorCourseRevenueDto::getTotalRevenue).sum();
        long totalCoursesSold = courseMap.values().stream().mapToLong(InstructorCourseRevenueDto::getSoldCount).sum();
        long totalPayments = paymentIds.size();

        List<InstructorCourseRevenueDto> courses = courseMap.values().stream()
                .sorted(Comparator.comparingLong(InstructorCourseRevenueDto::getTotalRevenue).reversed())
                .toList();

        List<InstructorRevenuePointDto> revenuePoints;
        if ("day".equals(normalizedGroupBy)) {
            revenuePoints = revenueByDay.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(e -> new InstructorRevenuePointDto(e.getKey().toString(), e.getValue()))
                    .toList();
        } else {
            revenuePoints = revenueByMonth.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(e -> new InstructorRevenuePointDto(e.getKey().toString(), e.getValue()))
                    .toList();
        }

        return new InstructorRevenueDetailDto(totalRevenue, totalCoursesSold, totalPayments, courses, revenuePoints);
    }

    private void updateCourseRevenue(Map<UUID, InstructorCourseRevenueDto> courseMap,
                                     Course course,
                                     long amount,
                                     LocalDateTime soldAt) {
        InstructorCourseRevenueDto existing = courseMap.get(course.getCourse_id());
        if (existing == null) {
            courseMap.put(
                    course.getCourse_id(),
                    new InstructorCourseRevenueDto(
                            course.getCourse_id(),
                            course.getCourse_name(),
                            course.getPrice(),
                            1,
                            amount,
                            soldAt
                    )
            );
            return;
        }

        existing.setSoldCount(existing.getSoldCount() + 1);
        existing.setTotalRevenue(existing.getTotalRevenue() + amount);
        if (soldAt != null && (existing.getLastSoldAt() == null || soldAt.isAfter(existing.getLastSoldAt()))) {
            existing.setLastSoldAt(soldAt);
        }
    }

    private void accumulateByPeriod(Map<YearMonth, Long> revenueByMonth,
                                    Map<LocalDate, Long> revenueByDay,
                                    LocalDateTime soldAt,
                                    long amount) {
        if (soldAt == null) return;
        YearMonth key = YearMonth.of(soldAt.getYear(), soldAt.getMonth());
        revenueByMonth.put(key, revenueByMonth.getOrDefault(key, 0L) + amount);

        LocalDate dayKey = soldAt.toLocalDate();
        revenueByDay.put(dayKey, revenueByDay.getOrDefault(dayKey, 0L) + amount);
    }

    private LocalDateTime getPaymentDate(Payment payment) {
        if (payment == null) return null;
        return payment.getPayDate() != null ? payment.getPayDate() : payment.getCreatedAt();
    }

    private LocalDate parseDate(String value) {
        if (!StringUtils.hasText(value)) return null;
        try {
            return LocalDate.parse(value);
        } catch (Exception e) {
            return null;
        }
    }

    private boolean isInRange(LocalDateTime soldAt, LocalDate from, LocalDate to) {
        if (soldAt == null) return false;
        LocalDate date = soldAt.toLocalDate();
        if (from != null && date.isBefore(from)) return false;
        if (to != null && date.isAfter(to)) return false;
        return true;
    }

    public PaymentUrlResponse createCartPayment(CartPaymentRequest request, String clientIp) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getCourseIds() == null || request.getCourseIds().isEmpty()) {
            throw new IllegalArgumentException("Course IDs cannot be empty");
        }

        // Validate all courses exist and user is not enrolled
        List<Course> courses = new ArrayList<>();
        long totalAmount = 0;
        List<String> courseNames = new ArrayList<>();

        for (UUID courseId : request.getCourseIds()) {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new IllegalArgumentException("Course not found: " + courseId));

            if (learningService.isUserEnrolled(user, course)) {
                throw new IllegalStateException("User already enrolled to course: " + course.getCourse_name());
            }

            courses.add(course);
            totalAmount += course.getPrice();
            courseNames.add(course.getCourse_name());
        }

        // Apply promotion code if provided
        Promotion promotion = null;
        long discountAmount = 0;
        if (StringUtils.hasText(request.getPromotionCode())) {
            promotion = promotionService.getPromotionByCode(request.getPromotionCode());
            if (promotion != null) {
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime startDate = promotion.getStart_date();
                LocalDateTime endDate = promotion.getEnd_date();

                if (promotion.getIs_active() && now.isAfter(startDate) && now.isBefore(endDate)) {
                    discountAmount = (long) (totalAmount * promotion.getDiscount_percent() / 100.0);
                    totalAmount = totalAmount - discountAmount;
                } else {
                    throw new IllegalStateException("Mã khuyến mãi không hợp lệ hoặc đã hết hạn");
                }
            } else {
                throw new IllegalArgumentException("Mã khuyến mãi không tồn tại");
            }
        }

        String txnRef = generateTxnRef();
        String locale = StringUtils.hasText(request.getLocale()) ? request.getLocale() : vnPayProperties.getLocale();
        String orderInfoRaw = String.format(Locale.ENGLISH, "Pay_%s_for_%d_courses", user.getUsername(), courses.size());
        if (promotion != null) {
            orderInfoRaw += "_PROMO_" + promotion.getCode();
        }
        String orderInfo = sanitizeOrderInfo(orderInfoRaw);
        String createDate = LocalDateTime.now().format(VNP_DATE_FORMAT);
        String expireDate = LocalDateTime.now()
                .plusMinutes(Math.max(1, vnPayProperties.getExpireMinutes()))
                .format(VNP_DATE_FORMAT);

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", vnPayProperties.getVersion());
        params.put("vnp_Command", vnPayProperties.getCommand());
        params.put("vnp_TmnCode", vnPayProperties.getTmnCode());
        params.put("vnp_Amount", String.valueOf(totalAmount * 100));
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

        // Build hash data & query string
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

            hashData.append(fieldName);
            hashData.append('=');
            hashData.append(encode(fieldValue));

            query.append(encode(fieldName));
            query.append('=');
            query.append(encode(fieldValue));

            firstParam = false;
        }

        String secureHash = VnPayUtils.hmacSHA512(vnPayProperties.getHashSecret(), hashData.toString());
        String paymentUrl = vnPayProperties.getPayUrl() + "?" + query + "&vnp_SecureHash=" + secureHash;

        // Create payment with first course (for backward compatibility)
        Payment payment = Payment.builder()
                .user(user)
                .course(courses.get(0))
                .amount(totalAmount)
                .currency(vnPayProperties.getCurrCode())
                .txnRef(txnRef)
                .orderInfo(orderInfo)
                .orderType(vnPayProperties.getOrderType())
                .locale(locale)
                .bankCode(request.getBankCode())
                .ipAddress(clientIp)
                .status(PaymentStatus.PENDING)
                .build();
        payment = paymentRepository.save(payment);

        // Create PaymentCourse entries for all courses
        for (Course course : courses) {
            PaymentCourse paymentCourse = PaymentCourse.builder()
                    .payment(payment)
                    .course(course)
                    .build();
            paymentCourseRepository.save(paymentCourse);
        }

        return PaymentUrlResponse.builder()
                .paymentUrl(paymentUrl)
                .txnRef(txnRef)
                .amount(totalAmount)
                .build();
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
                // Check if this is a cart payment (has PaymentCourse entries)
                List<PaymentCourse> paymentCourses = paymentCourseRepository.findAllByPayment(payment);
                if (!paymentCourses.isEmpty()) {
                    // Enroll user in all courses from cart
                    for (PaymentCourse paymentCourse : paymentCourses) {
                        learningService.enrollUserInCourse(payment.getUser(), paymentCourse.getCourse());
                    }
                } else {
                    // Single course payment (backward compatibility)
                    learningService.enrollUserInCourse(payment.getUser(), payment.getCourse());
                }
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

