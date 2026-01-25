package com.rochanegra.api.projects.dto;

import java.util.UUID;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;

public record TaskCreateDto(
                @NotBlank String title,
                String description,
                UUID projectId, // Nullable for personal/inbox tasks
                UUID parentId, // Nullable for top-level tasks
                UUID assignedTo,
                Integer priority,
                LocalDate dueDate) {
}