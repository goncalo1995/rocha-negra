package com.rochanegra.api.finance.assets;

import com.rochanegra.api.finance.types.AssetType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record AssetDto(
                UUID id,
                String name,
                AssetType type,
                BigDecimal quantity,
                BigDecimal balance,
                String currency,
                String institution,
                String description,
                Map<String, Object> customFields,
                Instant createdAt,
                Instant updatedAt) {
}
