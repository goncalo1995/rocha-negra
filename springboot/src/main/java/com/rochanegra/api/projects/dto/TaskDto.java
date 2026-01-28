package com.rochanegra.api.projects.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDate;

import com.rochanegra.api.projects.types.TaskStatus;

public record TaskDto(
                UUID id,
                UUID projectId,
                UUID parentId,
                UUID createdBy,
                UUID assignedTo,
                String title,
                String description,
                TaskStatus status,
                Integer priority,
                LocalDate dueDate,
                Instant completedAt,
                Integer position,
                Map<String, Object> customFields,
                Instant createdAt,
                Instant updatedAt,
                List<TaskDto> subtasks) {
}
