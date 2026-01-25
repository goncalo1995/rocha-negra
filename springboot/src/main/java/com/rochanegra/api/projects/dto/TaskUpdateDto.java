package com.rochanegra.api.projects.dto;

import java.util.UUID;
import java.time.LocalDate;
import com.rochanegra.api.projects.types.TaskStatus;

public record TaskUpdateDto(
                String title,
                String description,
                UUID assignedTo,
                TaskStatus status,
                Integer priority,
                LocalDate dueDate,
                Integer position) {
}