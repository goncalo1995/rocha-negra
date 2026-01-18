package com.rochanegra.api.finance.assets;

import com.rochanegra.api.finance.types.AssetType;
import java.math.BigDecimal;
import java.util.UUID;

public record AssetDto(
        UUID id,
        String name,
        AssetType type,
        BigDecimal currentValue,
        String institution) {
}
