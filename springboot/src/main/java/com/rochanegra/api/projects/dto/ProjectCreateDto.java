package com.rochanegra.api.projects.dto;

import jakarta.validation.constraints.NotBlank;

// --- DTO for CREATING a project ---
public record ProjectCreateDto(
        @NotBlank String name,
        String description) {
}