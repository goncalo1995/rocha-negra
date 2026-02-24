package com.rochanegra.api.modules.nodes.dto;

import java.time.Instant;
import java.util.UUID;

import com.rochanegra.api.modules.nodes.types.NodeLinkType;
import com.rochanegra.api.modules.nodes.types.NodeType;

public record NodeLinkDto(
                UUID id,
                String name,
                NodeType type,
                NodeLinkType linkType,
                UUID createdBy,
                Instant createdAt) {
}