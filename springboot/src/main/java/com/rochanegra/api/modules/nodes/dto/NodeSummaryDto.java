package com.rochanegra.api.modules.nodes.dto;

import java.util.UUID;

import com.rochanegra.api.modules.nodes.domain.Node;
import com.rochanegra.api.modules.nodes.types.NodeStatus;
import com.rochanegra.api.modules.nodes.types.NodeType;

import java.time.Instant;
import java.time.LocalDate;

public record NodeSummaryDto(
        UUID id,
        String name,
        NodeStatus status,
        NodeType type,
        LocalDate dueDate,
        Instant createdAt,
        Instant updatedAt,
        int memberCount,
        int taskCount) {
    public static NodeSummaryDto fromEntity(Node node) {
        return new NodeSummaryDto(
                node.getId(),
                node.getName(),
                node.getStatus(),
                node.getType(),
                node.getDueDate(),
                node.getCreatedAt(),
                node.getUpdatedAt(),
                node.getMembers().size(),
                node.getTasks().size());
    }

}