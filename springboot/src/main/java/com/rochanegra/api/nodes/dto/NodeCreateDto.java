package com.rochanegra.api.nodes.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.rochanegra.api.nodes.types.NodeStatus;
import com.rochanegra.api.nodes.types.NodeType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// --- DTO for CREATING a node ---
public record NodeCreateDto(
                @NotBlank String name,
                String description,
                @NotNull NodeType type,
                NodeStatus status,
                UUID parentId,
                LocalDate dueDate) {
}