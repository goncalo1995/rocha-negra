package com.rochanegra.api.nodes.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.rochanegra.api.nodes.types.NodeStatus;
import com.rochanegra.api.nodes.types.NodeType;

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
                List<NodeLinkDto> incomingLinks,
                List<NodeLinkDto> outgoingLinks) {
}