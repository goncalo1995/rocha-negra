package com.rochanegra.api.finance.categories;

import com.rochanegra.api.finance.types.TransactionType;

import com.rochanegra.api.finance.types.CategoryNature;
import java.util.UUID;

public record CategoryDto(
        UUID id,
        String name,
        String type,
        CategoryNature nature,
        String iconSlug,
        String color) {
}
