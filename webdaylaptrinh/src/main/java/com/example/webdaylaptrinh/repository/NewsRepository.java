package com.example.webdaylaptrinh.repository;

import com.example.webdaylaptrinh.entity.News;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface NewsRepository extends JpaRepository<News, UUID> {
    @Query("SELECT n FROM News n WHERE n.is_featured = true ORDER BY n.created_at DESC")
    List<News> findFeatured();

    @Query("SELECT n FROM News n ORDER BY n.created_at DESC")
    List<News> findAllByCreated();
}


