package com.rochanegra.api.tasks.dtos;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.rochanegra.api.tasks.TaskStatus;

import java.time.LocalDate;

public record TaskDto(
        UUID id,
        UUID nodeId,
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
        String nodeName,
        Instant createdAt,
        Instant updatedAt,
        List<TaskDto> subtasks) {
}
