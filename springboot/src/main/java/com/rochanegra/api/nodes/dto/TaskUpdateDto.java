package com.rochanegra.api.nodes.dto;

import java.util.UUID;

import com.rochanegra.api.nodes.types.TaskStatus;

import java.time.LocalDate;

public record TaskUpdateDto(
        String title,
        String description,
        UUID assignedTo,
        TaskStatus status,
        Integer priority,
        LocalDate dueDate,
        Integer position) {
}