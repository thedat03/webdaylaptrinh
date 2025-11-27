package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface BannerRepository extends JpaRepository<Banner, UUID> {
    @Query("SELECT b FROM Banner b WHERE b.is_active = true ORDER BY b.display_order ASC")
    List<Banner> findAllActiveOrdered();

    @Query("SELECT b FROM Banner b ORDER BY b.display_order ASC")
    List<Banner> findAllOrdered();
}

