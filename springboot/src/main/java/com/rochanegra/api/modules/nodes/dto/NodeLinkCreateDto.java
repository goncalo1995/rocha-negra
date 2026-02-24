package com.rochanegra.api.modules.nodes.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

import com.rochanegra.api.modules.nodes.types.NodeLinkType;

public record NodeLinkCreateDto(
                @NotNull UUID targetNodeId,
                NodeLinkType type) {
}
