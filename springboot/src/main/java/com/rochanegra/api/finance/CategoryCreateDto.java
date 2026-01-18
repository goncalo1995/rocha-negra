package com.rochanegra.api.finance;

import com.rochanegra.api.finance.types.CategoryNature;

public record CategoryCreateDto(
        String name,
        String type,
        CategoryNature nature,
        String iconSlug,
        String color) {
}
