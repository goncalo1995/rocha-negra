package com.rochanegra.api.nodes.dto;

import java.util.UUID;

import com.rochanegra.api.nodes.Node;
import com.rochanegra.api.nodes.types.NodeStatus;
import com.rochanegra.api.nodes.types.NodeType;

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