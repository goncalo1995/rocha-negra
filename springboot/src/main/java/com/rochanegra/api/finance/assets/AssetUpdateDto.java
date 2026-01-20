package com.rochanegra.api.finance.assets;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import com.rochanegra.api.finance.types.AssetType;

public record AssetUpdateDto(
        UUID id,
        String name,
        AssetType type,
        String currency,
        BigDecimal currentValue,
        String institution,
        String description,
        Map<String, String> customFields) {
}
