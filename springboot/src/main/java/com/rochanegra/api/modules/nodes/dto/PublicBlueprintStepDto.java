package com.rochanegra.api.modules.nodes.dto;

import java.util.UUID;

public record PublicBlueprintStepDto(
                UUID id,
                UUID parentId,
                String title,
                String description,
                String status,
                Integer position) {
}
