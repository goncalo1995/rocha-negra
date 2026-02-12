package com.rochanegra.api.nodes.dto;

import java.util.UUID;
import java.time.LocalDate;

public record TaskSummaryDto(
                UUID id,
                String title,
                String status,
                LocalDate dueDate) {
}
