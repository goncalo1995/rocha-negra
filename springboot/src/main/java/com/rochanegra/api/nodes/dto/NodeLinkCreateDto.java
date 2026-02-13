package com.rochanegra.api.nodes.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record NodeLinkCreateDto(
        @NotNull UUID targetNodeId,
        String label) {
}
