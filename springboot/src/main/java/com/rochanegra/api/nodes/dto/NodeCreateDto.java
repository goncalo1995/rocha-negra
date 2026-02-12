package com.rochanegra.api.nodes.dto;

import com.rochanegra.api.nodes.types.NodeType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// --- DTO for CREATING a node ---
public record NodeCreateDto(
                @NotBlank String name,
                String description,
                @NotNull NodeType type) {
}