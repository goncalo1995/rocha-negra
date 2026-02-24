package com.rochanegra.api.modules.finance.assets;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import com.rochanegra.api.modules.finance.types.AssetType;

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
