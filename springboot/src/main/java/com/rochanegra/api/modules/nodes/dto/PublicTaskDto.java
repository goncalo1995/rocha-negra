package com.rochanegra.api.modules.nodes.dto;

import java.time.LocalDate;
import java.util.UUID;

public record PublicTaskDto(
                UUID id,
                String title,
                String description,
                String status,
                Integer priority,
                LocalDate dueDate) {
}
