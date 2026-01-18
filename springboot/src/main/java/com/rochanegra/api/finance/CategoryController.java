package com.rochanegra.api.finance;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getMyCategories(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        List<CategoryDto> categories = categoryService.getCategoriesForUser(userId);
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(@RequestBody CategoryCreateDto createDto,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        CategoryDto newCategory = categoryService.createCategory(createDto, userId);
        return new ResponseEntity<>(newCategory, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        categoryService.deleteCategory(id, userId);
        return ResponseEntity.noContent().build();
    }
}
