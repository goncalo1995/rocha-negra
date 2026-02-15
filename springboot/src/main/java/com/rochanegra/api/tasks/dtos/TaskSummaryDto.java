package com.rochanegra.api.tasks.dtos;

import java.util.UUID;
import java.time.LocalDate;

import com.rochanegra.api.tasks.Task;

public record TaskSummaryDto(
                UUID id,
                String title,
                String status,
                Integer priority,
                LocalDate dueDate) {
        public static TaskSummaryDto fromEntity(Task task) {
                return new TaskSummaryDto(
                                task.getId(),
                                task.getTitle(),
                                task.getStatus().name(),
                                task.getPriority(),
                                task.getDueDate());
        }

}
