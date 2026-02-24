package com.rochanegra.api.modules.dashboard.dtos;

import java.util.List;

import com.rochanegra.api.modules.tasks.dtos.TaskSummaryDto;

public record TasksWidgetDto(
        int totalTasks,
        List<TaskSummaryDto> recentTasks) {
}
