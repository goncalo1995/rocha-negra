package com.rochanegra.api.nodes.dto;

import com.rochanegra.api.nodes.types.NodeType;
import java.util.List;
import java.util.UUID;

public record NodeTreeDto(
        UUID id,
        String name,
        NodeType type,
        List<NodeTreeDto> children,
        int count // Optional: number of tasks or direct children, etc.
) {
}
