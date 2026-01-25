package com.rochanegra.api.finance.categories;

// DTO for updating a category. All fields are optional.
public record CategoryUpdateDto(
        String name,
        String iconSlug,
        String color
// We intentionally omit 'type' (income/expense) and 'nature'
// because changing these would break historical reporting.
) {
}