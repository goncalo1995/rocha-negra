package com.rochanegra.api.finance;

import com.rochanegra.api.finance.types.CategoryNature;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CategoryCreateDto(
                @NotBlank String name,
                @NotBlank String type,
                @NotNull CategoryNature nature,
                String iconSlug,
                String color) {
}
