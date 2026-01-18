package com.rochanegra.api.finance;

import com.rochanegra.api.finance.types.AssetType;
import java.math.BigDecimal;

public record AssetCreateDto(
        String name,
        AssetType type,
        BigDecimal currentValue,
        String institution) {
}
