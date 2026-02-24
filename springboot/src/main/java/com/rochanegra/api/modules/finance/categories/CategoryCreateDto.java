package com.rochanegra.api.modules.finance.categories;

import com.rochanegra.api.modules.finance.types.CategoryNature;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CategoryCreateDto(
                @NotBlank String name,
                @NotBlank @Pattern(regexp = "income|expense", message = "Type must be 'income' or 'expense'") String type,
                @NotNull CategoryNature nature,
                String iconSlug,
                String color) {
}
