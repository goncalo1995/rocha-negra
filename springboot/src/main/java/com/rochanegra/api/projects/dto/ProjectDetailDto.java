package com.rochanegra.api.projects.dto;

import java.util.List;
import java.util.UUID;

import com.rochanegra.api.projects.types.ProjectStatus;
import java.time.LocalDate;

public record ProjectDetailDto(
        UUID id,
        String name,
        String description,
        ProjectStatus status,
        LocalDate dueDate,
        List<ProjectMemberDto> members,
        List<TaskSummaryDto> tasks) {
}