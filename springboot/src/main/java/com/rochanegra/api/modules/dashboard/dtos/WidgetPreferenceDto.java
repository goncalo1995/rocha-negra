package com.rochanegra.api.modules.dashboard.dtos;

// later group by category
public record WidgetPreferenceDto(
        String key,
        String title,
        boolean enabled,
        int order) {
}
