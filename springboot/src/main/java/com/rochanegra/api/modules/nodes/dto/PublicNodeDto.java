package com.rochanegra.api.modules.nodes.dto;

import com.rochanegra.api.modules.nodes.types.NodeType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PublicNodeDto(
                UUID id,
                String name,
                String description,
                String content,
                String icon,
                NodeType type,
                List<PublicTaskDto> tasks,
                List<PublicBlueprintStepDto> blueprint,
                Instant updatedAt) {
}
