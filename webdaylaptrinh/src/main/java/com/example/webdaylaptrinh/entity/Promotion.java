package com.example.webdaylaptrinh.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "promotions")
public class Promotion {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "promotion_id", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID promotion_id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private Double discount_percent; // Phần trăm giảm giá (ví dụ: 20.0 = 20%)

    @Column(nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime start_date;

    @Column(nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime end_date;

    @Column
    private String image_url;

    @Column(nullable = false)
    private Boolean is_active = true;

    @Column
    private String code; // Mã khuyến mãi (ví dụ: "SUMMER2024")

    @Column
    private LocalDateTime created_at = LocalDateTime.now();

    @Column
    private LocalDateTime updated_at = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updated_at = LocalDateTime.now();
    }
}

