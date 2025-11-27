
package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.entity.News;
import com.example.webdaylaptrinh.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {
    private final NewsService newsService;

    @GetMapping
    public List<News> getFeatured() { return newsService.getFeaturedNews(); }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<News> getAll() { return newsService.getAllNews(); }

    @GetMapping("/{id}")
    public News byId(@PathVariable UUID id) { return newsService.getNewsById(id); }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public News create(@RequestBody News n) { return newsService.createNews(n); }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public News update(@PathVariable UUID id, @RequestBody News n) { return newsService.updateNews(id, n); }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable UUID id) { newsService.deleteNews(id); }
}


