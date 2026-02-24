package com.rochanegra.api.modules.tasks.dtos;

import java.util.UUID;

import com.rochanegra.api.modules.tasks.TaskStatus;

import java.time.LocalDate;

public record TaskUpdateDto(
        UUID nodeId,
        UUID parentId,
        String title,
        String description,
        UUID assignedTo,
        TaskStatus status,
        Integer priority,
        LocalDate dueDate,
        Integer position) {
}