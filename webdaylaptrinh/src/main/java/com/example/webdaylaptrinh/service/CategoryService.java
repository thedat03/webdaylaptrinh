package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.entity.Category;
import com.example.webdaylaptrinh.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAllOrdered();
    }

    public Category getCategoryById(UUID id) {
        return categoryRepository.findById(id).orElse(null);
    }

    public Category createCategory(Category category) {
        if (category.getDisplayOrder() == null) {
            long maxOrder = categoryRepository.findAll().stream()
                    .mapToLong(c -> c.getDisplayOrder() != null ? c.getDisplayOrder() : 0)
                    .max()
                    .orElse(0);
            category.setDisplayOrder((int)(maxOrder + 1));
        }
        return categoryRepository.save(category);
    }

    public Category updateCategory(UUID id, Category updatedCategory) {
        Category existing = categoryRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setName(updatedCategory.getName());
            existing.setDescription(updatedCategory.getDescription());
            existing.setImage_url(updatedCategory.getImage_url());
            existing.setDisplayOrder(updatedCategory.getDisplayOrder());
            return categoryRepository.save(existing);
        }
        return null;
    }

    public void deleteCategory(UUID id) {
        categoryRepository.deleteById(id);
    }
}

