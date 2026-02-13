package com.rochanegra.api.dashboard.dtos;

import java.util.List;

import com.rochanegra.api.tasks.dtos.TaskSummaryDto;

public record TasksWidgetDto(
        int totalTasks,
        List<TaskSummaryDto> recentTasks) {
}
