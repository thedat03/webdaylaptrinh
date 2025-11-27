package com.example.webdaylaptrinh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "banners")
public class Banner {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "banner_id", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID banner_id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private String image_url;

    private String link_url; // Optional link when banner is clicked

    @Column(nullable = false)
    private Integer display_order; // For sorting banners

    private Boolean is_active = true; // To enable/disable banners
}

