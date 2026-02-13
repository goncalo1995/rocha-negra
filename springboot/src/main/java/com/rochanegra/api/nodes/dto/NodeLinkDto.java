package com.rochanegra.api.nodes.dto;

import com.rochanegra.api.nodes.types.NodeLinkType;
import com.rochanegra.api.nodes.types.NodeType;

import java.time.Instant;
import java.util.UUID;

public record NodeLinkDto(
                UUID nodeId,
                String nodeName,
                NodeType nodeType,
                NodeLinkType type,
                UUID createdBy,
                Instant createdAt) {
}