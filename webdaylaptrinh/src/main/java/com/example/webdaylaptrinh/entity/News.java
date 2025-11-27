package com.example.webdaylaptrinh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "news")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class News {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "news_id", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID news_id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String summary;

    @Lob
    private String content;

    @Column
    private String image_url;

    @Column
    private String link_url;

    @Column
    private Boolean is_featured = true;

    @Column
    private LocalDateTime created_at = LocalDateTime.now();
}


