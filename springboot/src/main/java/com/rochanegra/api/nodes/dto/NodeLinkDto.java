package com.rochanegra.api.nodes.dto;

import com.rochanegra.api.nodes.types.NodeType;

import java.time.Instant;
import java.util.UUID;

public record NodeLinkDto(
                UUID targetNodeId,
                String targetNodeName,
                NodeType targetNodeType,
                String label,
                UUID createdBy,
                Instant createdAt) {
}