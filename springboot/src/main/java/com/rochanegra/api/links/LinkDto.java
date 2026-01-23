package com.rochanegra.api.links;

import java.util.UUID;

// DTO for viewing an existing link
public record LinkDto(
                UUID id,
                UUID sourceEntityId,
                String sourceEntityType,
                UUID targetEntityId,
                String targetEntityType,
                String relationType) {
}