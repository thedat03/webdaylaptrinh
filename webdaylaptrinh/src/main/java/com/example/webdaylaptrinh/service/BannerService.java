package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.entity.Banner;
import com.example.webdaylaptrinh.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class BannerService {
    private final BannerRepository bannerRepository;

    public List<Banner> getAllActiveBanners() {
        return bannerRepository.findAllActiveOrdered();
    }

    public List<Banner> getAllBanners() {
        return bannerRepository.findAllOrdered();
    }

    public Banner getBannerById(UUID id) {
        return bannerRepository.findById(id).orElse(null);
    }

    public Banner createBanner(Banner banner) {
        if (banner.getDisplay_order() == null) {
            long maxOrder = bannerRepository.findAll().stream()
                    .mapToLong(b -> b.getDisplay_order() != null ? b.getDisplay_order() : 0)
                    .max()
                    .orElse(0);
            banner.setDisplay_order((int)(maxOrder + 1));
        }
        if (banner.getIs_active() == null) {
            banner.setIs_active(true);
        }
        return bannerRepository.save(banner);
    }

    public Banner updateBanner(UUID id, Banner updatedBanner) {
        Banner existing = bannerRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setTitle(updatedBanner.getTitle());
            existing.setDescription(updatedBanner.getDescription());
            existing.setImage_url(updatedBanner.getImage_url());
            existing.setLink_url(updatedBanner.getLink_url());
            existing.setDisplay_order(updatedBanner.getDisplay_order());
            existing.setIs_active(updatedBanner.getIs_active());
            return bannerRepository.save(existing);
        }
        return null;
    }

    public void deleteBanner(UUID id) {
        bannerRepository.deleteById(id);
    }
}

