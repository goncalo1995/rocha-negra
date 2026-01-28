package com.rochanegra.api.projects.dto;

import java.util.UUID;
import java.time.Instant;
import java.time.LocalDate;
import com.rochanegra.api.projects.types.ProjectStatus;

public record ProjectSummaryDto(
                UUID id,
                String name,
                ProjectStatus status,
                LocalDate dueDate,
                Instant createdAt,
                Instant updatedAt,
                int memberCount,
                int taskCount) {
}