package com.rochanegra.api.finance.categories;

import com.rochanegra.api.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryDto getCategory(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return toDto(category);
    }

    public CategoryDto updateCategory(UUID categoryId, CategoryCreateDto updateDto) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (updateDto.name() != null)
            category.setName(updateDto.name());
        if (updateDto.type() != null)
            category.setType(updateDto.type());
        if (updateDto.nature() != null)
            category.setNature(updateDto.nature());
        if (updateDto.iconSlug() != null)
            category.setIconSlug(updateDto.iconSlug());
        if (updateDto.color() != null)
            category.setColor(updateDto.color());

        Category savedCategory = categoryRepository.save(category);
        return toDto(savedCategory);
    }

    public List<CategoryDto> getAllCategories(UUID userId) {
        return categoryRepository.findByUserId(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CategoryDto createCategory(CategoryCreateDto createDto, UUID userId) {
        Category category = new Category();
        category.setName(createDto.name());
        category.setType(createDto.type());
        category.setNature(createDto.nature());
        category.setIconSlug(createDto.iconSlug());
        category.setColor(createDto.color());
        category.setUserId(userId);

        Category savedCategory = categoryRepository.save(category);
        return toDto(savedCategory);
    }

    public void deleteCategory(UUID categoryId, UUID userId) {
        // Ensure the category belongs to the user before deleting
        // In a real app, you'd use a findByIdAndUserId method or check ownership
        categoryRepository.findById(categoryId).ifPresent(category -> {
            if (category.getUserId().equals(userId)) {
                categoryRepository.delete(category);
            } else {
                throw new ResourceNotFoundException("Category not found or access denied");
            }
        });
    }

    public Optional<Category> findCategoryBySystemKey(UUID userId, String systemKey) {
        return categoryRepository.findByUserIdAndSystemKey(userId, systemKey);
    }

    private CategoryDto toDto(Category category) {
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getType(),
                category.getNature(),
                category.getIconSlug(),
                category.getColor());
    }
}
