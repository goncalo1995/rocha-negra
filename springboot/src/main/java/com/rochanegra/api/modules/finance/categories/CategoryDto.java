package com.rochanegra.api.modules.finance.categories;

import java.util.UUID;

import com.rochanegra.api.modules.finance.types.CategoryNature;

public record CategoryDto(
        UUID id,
        String name,
        String type,
        CategoryNature nature,
        String iconSlug,
        String color) {
}
