package com.rochanegra.api.modules.blueprint.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.rochanegra.api.modules.tasks.TaskStatus;

public record BlueprintStepDto(
        UUID id,
        UUID nodeId,
        UUID parentId,
        Integer position,
        String title,
        String description,
        TaskStatus status,
        List<UUID> contextNodeIds,
        String details,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
}
