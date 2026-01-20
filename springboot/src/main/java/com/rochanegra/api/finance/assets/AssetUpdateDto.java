package com.rochanegra.api.finance.assets;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import com.rochanegra.api.finance.types.AssetType;

public record AssetUpdateDto(
                String name,
                String institution,
                String description,
                Map<String, Object> customFields) {
}
