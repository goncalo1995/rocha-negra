package com.rochanegra.api.projects.dto;

import java.time.LocalDate;
import com.rochanegra.api.projects.types.ProjectStatus;

public record ProjectUpdateDto(
        String name,
        String description,
        ProjectStatus status,
        LocalDate dueDate) {
}