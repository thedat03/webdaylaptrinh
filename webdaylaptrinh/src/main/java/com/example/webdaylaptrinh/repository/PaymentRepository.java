package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.dto.PaymentAdminView;
import com.example.webdaylaptrinh.entity.Payment;
import com.example.webdaylaptrinh.entity.PaymentCourse;
import com.example.webdaylaptrinh.entity.User;
import com.example.webdaylaptrinh.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;

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

    @Query("SELECT COALESCE(SUM(p.amount), 0) " +
            "FROM Payment p " +
            "WHERE p.status = :status " +
            "AND p.course.user.id = :instructorId " +
            "AND NOT EXISTS (SELECT 1 FROM PaymentCourse pc WHERE pc.payment = p)")
    Long sumRevenueByInstructorSingle(@Param("instructorId") UUID instructorId,
                                      @Param("status") PaymentStatus status);

    @Query("SELECT COUNT(p) " +
            "FROM Payment p " +
            "WHERE p.status = :status " +
            "AND p.course.user.id = :instructorId " +
            "AND NOT EXISTS (SELECT 1 FROM PaymentCourse pc WHERE pc.payment = p)")
    Long countPaymentsByInstructorSingle(@Param("instructorId") UUID instructorId,
                                         @Param("status") PaymentStatus status);

    @Query("SELECT p FROM Payment p JOIN FETCH p.course c " +
            "WHERE p.status = :status " +
            "AND c.user.id = :instructorId " +
            "AND NOT EXISTS (SELECT 1 FROM PaymentCourse pc WHERE pc.payment = p)")
    List<Payment> findPaidSingleByInstructorId(@Param("instructorId") UUID instructorId,
                                               @Param("status") PaymentStatus status);
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Payment p WHERE p.course.course_id = :courseId")
    void deleteByCourseId(@Param("courseId") UUID courseId);
}
