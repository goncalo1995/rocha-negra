package com.rochanegra.api.modules.blueprint.dto;

import java.util.List;
import java.util.UUID;

import com.rochanegra.api.modules.tasks.TaskStatus;

public record BlueprintStepCreateDto(
                UUID parentId,
                String title,
                String description,
                TaskStatus status,
                List<UUID> contextNodeIds,
                String details) {
}
