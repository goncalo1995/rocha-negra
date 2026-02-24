package com.rochanegra.api.modules.nodes.dto;

import java.util.UUID;

import com.rochanegra.api.modules.nodes.types.NodeType;

public record GraphNodeDto(
                UUID id,
                String name,
                NodeType type) {
}