package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.Payment;
import com.example.webdaylaptrinh.entity.PaymentCourse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PaymentCourseRepository extends JpaRepository<PaymentCourse, UUID> {
    List<PaymentCourse> findAllByPayment(Payment payment);
}

