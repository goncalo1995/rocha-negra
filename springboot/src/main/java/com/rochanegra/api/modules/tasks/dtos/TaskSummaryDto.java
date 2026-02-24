package com.rochanegra.api.modules.tasks.dtos;

import java.util.UUID;

import com.rochanegra.api.modules.tasks.Task;

import java.time.LocalDate;

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
