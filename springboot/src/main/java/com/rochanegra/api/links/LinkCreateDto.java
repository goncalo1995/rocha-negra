package com.rochanegra.api.links;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

// DTO for creating a new link
public record LinkCreateDto(
        @NotNull UUID sourceEntityId,
        @NotBlank String sourceEntityType,
        @NotNull UUID targetEntityId,
        @NotBlank String targetEntityType,
        @NotBlank String relationType) {
}