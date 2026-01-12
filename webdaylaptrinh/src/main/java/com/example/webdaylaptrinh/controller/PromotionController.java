package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.entity.Promotion;
import com.example.webdaylaptrinh.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {
    private final PromotionService promotionService;

    @GetMapping
    public List<Promotion> getAllActivePromotions() {
        return promotionService.getAllActivePromotions();
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Promotion> getAllPromotions() {
        return promotionService.getAllPromotions();
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Promotion> getAllActivePromotionsAdmin() {
        return promotionService.getAllActivePromotionsAdmin();
    }

    @GetMapping("/{id}")
    public Promotion getPromotionById(@PathVariable UUID id) {
        return promotionService.getPromotionById(id);
    }

    @GetMapping("/code/{code}")
    public Promotion getPromotionByCode(@PathVariable String code) {
        return promotionService.getPromotionByCode(code);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Promotion createPromotion(@RequestBody Promotion promotion) {
        return promotionService.createPromotion(promotion);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Promotion updatePromotion(@PathVariable UUID id, @RequestBody Promotion promotion) {
        return promotionService.updatePromotion(id, promotion);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deletePromotion(@PathVariable UUID id) {
        promotionService.deletePromotion(id);
    }
}

