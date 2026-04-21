package com.rochanegra.api.modules.nodes.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.rochanegra.api.modules.nodes.types.NodeStatus;
import com.rochanegra.api.modules.nodes.types.NodeType;
import com.rochanegra.api.modules.tasks.dtos.TaskSummaryDto;

import java.time.Instant;
import java.time.LocalDate;

public record NodeDetailDto(
                UUID id,
                UUID parentId,
                NodeType type,
                String name,
                String description,
                NodeStatus status,
                String icon,
                String content,
                String url,
                String storagePath,
                LocalDate startDate,
                LocalDate dueDate,
                Instant completedAt,
                Map<String, Object> customFields,
                Instant createdAt,
                Instant updatedAt,
                List<NodeMemberDto> members,
                List<TaskSummaryDto> tasks,
                List<NodeSummaryDto> children,
                List<NodeLinkDto> referencedBy,
                List<NodeLinkDto> references,
                List<NodeSummaryDto> ancestors,
                com.rochanegra.api.modules.roadmap.dto.ProjectDetailsDto projectDetails) {
}