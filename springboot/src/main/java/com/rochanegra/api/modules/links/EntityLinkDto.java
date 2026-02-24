package com.rochanegra.api.modules.links;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record EntityLinkDto(
                @NotNull UUID entityId,
                @NotBlank String entityType // e.g., "vehicle", "project"
) {
}