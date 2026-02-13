package com.rochanegra.api.dashboard.dtos;

public record WidgetPreferenceDto(
        String type,
        boolean enabled,
        int order) {
}