package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.entity.Promotion;
import com.example.webdaylaptrinh.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class PromotionService {
    private final PromotionRepository promotionRepository;

    public List<Promotion> getAllActivePromotions() {
        LocalDateTime now = LocalDateTime.now();
        return promotionRepository.findAllActiveAndCurrent(now);
    }

    public List<Promotion> getAllActivePromotionsAdmin() {
        return promotionRepository.findAllActive();
    }

    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAllOrdered();
    }

    public Promotion getPromotionById(UUID id) {
        return promotionRepository.findById(id).orElse(null);
    }

    public Promotion getPromotionByCode(String code) {
        LocalDateTime now = LocalDateTime.now();
        return promotionRepository.findActiveByCode(code, now).orElse(null);
    }

    public Promotion createPromotion(Promotion promotion) {
        if (promotion.getIs_active() == null) {
            promotion.setIs_active(true);
        }
        if (promotion.getCreated_at() == null) {
            promotion.setCreated_at(LocalDateTime.now());
        }
        if (promotion.getUpdated_at() == null) {
            promotion.setUpdated_at(LocalDateTime.now());
        }
        return promotionRepository.save(promotion);
    }

    public Promotion updatePromotion(UUID id, Promotion updatedPromotion) {
        Promotion existing = promotionRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setTitle(updatedPromotion.getTitle());
            existing.setDescription(updatedPromotion.getDescription());
            existing.setDiscount_percent(updatedPromotion.getDiscount_percent());
            existing.setStart_date(updatedPromotion.getStart_date());
            existing.setEnd_date(updatedPromotion.getEnd_date());
            existing.setImage_url(updatedPromotion.getImage_url());
            existing.setIs_active(updatedPromotion.getIs_active());
            existing.setCode(updatedPromotion.getCode());
            existing.setUpdated_at(LocalDateTime.now());
            return promotionRepository.save(existing);
        }
        return null;
    }

    public void deletePromotion(UUID id) {
        promotionRepository.deleteById(id);
    }
}

