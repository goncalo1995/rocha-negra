package com.rochanegra.api.finance;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.rochanegra.api.finance.types.TransactionType;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryDto> getCategoriesForUser(UUID userId) {
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
                throw new RuntimeException("Category not found or access denied");
            }
        });
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
