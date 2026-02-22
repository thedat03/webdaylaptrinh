package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.Payment;
import com.example.webdaylaptrinh.entity.PaymentCourse;
import com.example.webdaylaptrinh.enums.PaymentStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PaymentCourseRepository extends JpaRepository<PaymentCourse, UUID> {
    List<PaymentCourse> findAllByPayment(Payment payment);

    @Query("SELECT COALESCE(SUM(c.price), 0) " +
            "FROM PaymentCourse pc JOIN pc.payment p JOIN pc.course c " +
            "WHERE p.status = :status AND c.user.id = :instructorId")
    Long sumRevenueByInstructor(@Param("instructorId") UUID instructorId,
                                @Param("status") PaymentStatus status);

    @Query("SELECT COUNT(pc) " +
            "FROM PaymentCourse pc JOIN pc.payment p JOIN pc.course c " +
            "WHERE p.status = :status AND c.user.id = :instructorId")
    Long countCoursesSoldByInstructor(@Param("instructorId") UUID instructorId,
                                      @Param("status") PaymentStatus status);

    @Query("SELECT COUNT(DISTINCT p.id) " +
            "FROM PaymentCourse pc JOIN pc.payment p JOIN pc.course c " +
            "WHERE p.status = :status AND c.user.id = :instructorId")
    Long countPaymentsByInstructor(@Param("instructorId") UUID instructorId,
                                   @Param("status") PaymentStatus status);

    @Query("SELECT pc FROM PaymentCourse pc JOIN FETCH pc.payment p JOIN FETCH pc.course c " +
            "WHERE p.status = :status AND c.user.id = :instructorId")
    List<PaymentCourse> findPaidByInstructorId(@Param("instructorId") UUID instructorId,
                                               @Param("status") PaymentStatus status);
}

