package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.dto.PaymentAdminView;
import com.example.webdaylaptrinh.entity.Payment;
import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByTxnRef(String txnRef);
    List<Payment> findAllByUser(User user);
    long countByStatus(PaymentStatus status);

    @Query("""
            SELECT new com.example.webdaylaptrinh.dto.PaymentAdminView(
                p.id,
                p.txnRef,
                p.status,
                p.amount,
                p.currency,
                p.payDate,
                p.createdAt,
                p.bankCode,
                p.locale,
                u.id,
                u.username,
                u.email,
                c.course_id,
                c.course_name
            )
            FROM Payment p
            JOIN p.user u
            JOIN p.course c
            ORDER BY p.createdAt DESC
            """)
    List<PaymentAdminView> findAdminPaymentViews();
}
