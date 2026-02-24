package com.rochanegra.api.modules.nodes.dto;

import java.util.List;
import java.util.UUID;

import com.rochanegra.api.modules.nodes.types.NodeType;

public record NodeTreeDto(
                UUID id,
                String name,
                NodeType type,
                List<NodeTreeDto> children,
                int count // Optional: number of tasks or direct children, etc.
) {
}
