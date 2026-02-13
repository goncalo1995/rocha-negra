package com.rochanegra.api.nodes.dto;

import java.util.UUID;

import com.rochanegra.api.nodes.types.NodeLinkType;

public record GraphEdgeDto(
        UUID sourceId,
        UUID targetId,
        NodeLinkType type) {
}
