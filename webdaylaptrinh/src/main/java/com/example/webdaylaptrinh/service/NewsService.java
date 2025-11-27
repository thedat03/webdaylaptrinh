package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.entity.News;
import com.example.webdaylaptrinh.repository.NewsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NewsService {
    private final NewsRepository newsRepository;

    public List<News> getFeaturedNews() { return newsRepository.findFeatured(); }

    public List<News> getAllNews() { return newsRepository.findAllByCreated(); }

    public News getNewsById(UUID id) { return newsRepository.findById(id).orElse(null); }

    public News createNews(News n) { return newsRepository.save(n); }

    public News updateNews(UUID id, News updated) {
        News existing = newsRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setTitle(updated.getTitle());
            existing.setSummary(updated.getSummary());
            existing.setContent(updated.getContent());
            existing.setImage_url(updated.getImage_url());
            existing.setLink_url(updated.getLink_url());
            existing.setIs_featured(updated.getIs_featured());
            existing.setCreated_at(updated.getCreated_at() != null ? updated.getCreated_at() : existing.getCreated_at());
            return newsRepository.save(existing);
        }
        return null;
    }

    public void deleteNews(UUID id) { newsRepository.deleteById(id); }
}


