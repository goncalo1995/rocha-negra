package com.rochanegra.api.links;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record EntityLinkDto(
        @NotNull UUID entityId,
        @NotBlank String entityType // e.g., "vehicle", "project"
) {
}