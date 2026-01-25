package com.rochanegra.api.projects.dto;

import java.util.UUID;
import java.time.LocalDate;

public record TaskSummaryDto(
        UUID id,
        String title,
        String status,
        LocalDate dueDate) {
}
