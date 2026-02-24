package com.rochanegra.api.modules.nodes.dto;

import java.util.UUID;

import com.rochanegra.api.modules.nodes.types.NodeLinkType;

public record GraphEdgeDto(
                UUID sourceId,
                UUID targetId,
                NodeLinkType type) {
}
