package com.example.webdaylaptrinh.controller;

import com.example.webdaylaptrinh.entity.Banner;
import com.example.webdaylaptrinh.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {
    private final BannerService bannerService;

    @GetMapping
    public List<Banner> getAllActiveBanners() {
        return bannerService.getAllActiveBanners();
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Banner> getAllBanners() {
        return bannerService.getAllBanners();
    }

    @GetMapping("/{id}")
    public Banner getBannerById(@PathVariable UUID id) {
        return bannerService.getBannerById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Banner createBanner(@RequestBody Banner banner) {
        return bannerService.createBanner(banner);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Banner updateBanner(@PathVariable UUID id, @RequestBody Banner banner) {
        return bannerService.updateBanner(id, banner);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteBanner(@PathVariable UUID id) {
        bannerService.deleteBanner(id);
    }
}

