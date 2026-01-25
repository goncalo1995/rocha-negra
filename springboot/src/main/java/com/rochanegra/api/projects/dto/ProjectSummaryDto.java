package com.rochanegra.api.projects.dto;

import java.util.UUID;
import java.time.LocalDate;
import com.rochanegra.api.projects.types.ProjectStatus;

public record ProjectSummaryDto(
        UUID id,
        String name,
        ProjectStatus status,
        LocalDate dueDate,
        int memberCount,
        int taskCount) {
}