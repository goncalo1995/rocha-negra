package com.rochanegra.api.nodes.dto;

import java.util.UUID;

import com.rochanegra.api.nodes.types.NodeType;

public record GraphNodeDto(
        UUID id,
        String name,
        NodeType type) {
}