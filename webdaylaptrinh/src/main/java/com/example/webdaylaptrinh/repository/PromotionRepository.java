package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PromotionRepository extends JpaRepository<Promotion, UUID> {
    @Query("SELECT p FROM Promotion p WHERE p.is_active = true AND p.start_date <= :now AND p.end_date >= :now ORDER BY p.created_at DESC")
    List<Promotion> findAllActiveAndCurrent(LocalDateTime now);

    @Query("SELECT p FROM Promotion p WHERE p.is_active = true ORDER BY p.created_at DESC")
    List<Promotion> findAllActive();

    @Query("SELECT p FROM Promotion p ORDER BY p.created_at DESC")
    List<Promotion> findAllOrdered();

    Optional<Promotion> findByCode(String code);

    @Query("SELECT p FROM Promotion p WHERE p.code = :code AND p.is_active = true AND p.start_date <= :now AND p.end_date >= :now")
    Optional<Promotion> findActiveByCode(String code, LocalDateTime now);
}

