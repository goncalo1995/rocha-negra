package com.rochanegra.api.finance.assets;

import java.util.Map;

public record AssetUpdateDto(
        String name,
        String institution,
        String description,
        java.math.BigDecimal quantity,
        java.math.BigDecimal balance,
        Map<String, Object> customFields) {
}
