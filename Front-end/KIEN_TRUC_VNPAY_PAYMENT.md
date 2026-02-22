# Kiến trúc Tích hợp Thanh toán VNPay với Chữ ký số

## Tổng quan

Hệ thống tích hợp VNPay với cơ chế bảo mật HMAC-SHA512 và IPN (Instant Payment Notification) để đảm bảo tính toàn vẹn dữ liệu và xử lý giao dịch nhất quán.

## Sơ đồ Kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (React)                           │
│  CourseDetail/Cart → paymentService.createPayment()   │
└──────────────────┬─────────────────────────────────────┘
                   │ POST /api/payments
                   ▼
┌─────────────────────────────────────────────────────────┐
│         BACKEND (Spring Boot)                           │
│  ┌──────────────────────────────────────┐             │
│  │  PaymentController                    │             │
│  │  POST /api/payments                   │             │
│  └───────────────┬──────────────────────┘             │
│                  │                                     │
│  ┌───────────────▼──────────────────────┐             │
│  │  PaymentService                        │             │
│  │  1. Tạo Payment (PENDING)              │             │
│  │  2. Build VNPay params + chữ ký        │             │
│  │     HMAC-SHA512                        │             │
│  │  3. Return payment URL                 │             │
│  └───────────────┬──────────────────────┘             │
│                  │ Save to DB                          │
│                  ▼                                     │
│  ┌──────────────────────────────────────┐             │
│  │  DATABASE (MySQL)                     │             │
│  │  Payment: txnRef, amount, status       │             │
│  └──────────────────────────────────────┘             │
└──────────────────┼─────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│         VNPAY GATEWAY                                   │
│  User thanh toán → Xử lý giao dịch                     │
└──────────────────┬───────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────┐    ┌──────────────────────┐
│ Return URL   │    │ IPN (Server-to-      │
│ (Browser)    │    │  Server)             │
└──────┬───────┘    └──────────┬───────────┘
       │                       │
       │ GET /vnpay-return     │ GET /vnpay-ipn
       │ (params + hash)       │ (params + hash)
       ▼                       ▼
┌─────────────────────────────────────────────────────────┐
│  Backend: PaymentService                                │
│  1. Xác thực chữ ký HMAC-SHA512                         │
│  2. Tìm Payment theo txnRef                            │
│  3. Đánh giá: responseCode="00" → PAID                 │
│  4. Cập nhật DB + Enroll user + Notification           │
└──────────────────┬─────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────┐    ┌──────────────────────┐
│ Redirect to  │    │ IPN Response         │
│ Frontend     │    │ {RspCode: "00"}      │
└──────────────┘    └──────────────────────┘
```

## Luồng Xử lý

```
User → Frontend → Backend: createPayment()
    │
    ├─→ Build VNPay params
    ├─→ Tạo chữ ký: HMAC-SHA512(hashSecret, hashData)
    ├─→ Save Payment (PENDING)
    └─→ Return payment URL
        │
        ▼
Frontend redirect → VNPay Gateway
        │
        ▼
VNPay xử lý → Gọi Return URL + IPN
        │
        ├─→ Backend: Xác thực chữ ký
        ├─→ Đánh giá trạng thái (PAID/FAILED)
        ├─→ Cập nhật DB
        └─→ Nếu PAID: Enroll user + Notification
```


