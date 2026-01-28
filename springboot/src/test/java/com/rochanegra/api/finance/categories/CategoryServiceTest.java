package com.rochanegra.api.finance.categories;

import com.rochanegra.api.exception.ResourceNotFoundException;
import com.rochanegra.api.finance.types.CategoryNature;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private UUID userId;
    private UUID categoryId;
    private Category category;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        categoryId = UUID.randomUUID();
        category = new Category();
        category.setId(categoryId);
        category.setUserId(userId);
        category.setName("Food");
        category.setType("expense");
        category.setNature(CategoryNature.variable);
    }

    @Test
    void getCategory_found_shouldReturnCategoryDto() {
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));

        CategoryDto result = categoryService.getCategory(categoryId);

        assertNotNull(result);
        assertEquals("Food", result.name());
    }

    @Test
    void getCategory_notFound_shouldThrowResourceNotFoundException() {
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> categoryService.getCategory(categoryId));
    }

    @Test
    void createCategory_validRequest_shouldSaveAndReturnDto() {
        CategoryCreateDto createDto = new CategoryCreateDto("Work", "income", CategoryNature.variable, "briefcase",
                "#blue");

        when(categoryRepository.save(any(Category.class))).thenAnswer(i -> {
            Category c = i.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });

        CategoryDto result = categoryService.createCategory(createDto, userId);

        assertNotNull(result);
        assertEquals("Work", result.name());
        assertEquals("income", result.type());
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    void getAllCategories_shouldReturnListForUser() {
        when(categoryRepository.findByUserId(userId)).thenReturn(List.of(category));

        List<CategoryDto> results = categoryService.getAllCategories(userId);

        assertEquals(1, results.size());
        assertEquals("Food", results.get(0).name());
    }

    @Test
    void deleteCategory_systemCategory_shouldThrowIllegalArgumentException() {
        category.setSystemKey("system_key");
        when(categoryRepository.findByIdAndUserId(categoryId, userId)).thenReturn(Optional.of(category));

        assertThrows(IllegalArgumentException.class, () -> categoryService.deleteCategory(categoryId, userId));
        verify(categoryRepository, never()).delete(any());
    }

    @Test
    void deleteCategory_userCategory_shouldCallDelete() {
        category.setSystemKey(null);
        when(categoryRepository.findByIdAndUserId(categoryId, userId)).thenReturn(Optional.of(category));

        categoryService.deleteCategory(categoryId, userId);

        verify(categoryRepository).delete(category);
    }
}
