package com.rochanegra.api.modules.finance.assets;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;

import com.rochanegra.api.modules.finance.types.AssetType;

public record AssetCreateDto(
        @NotBlank String name,
        @NotNull AssetType type,
        @NotBlank String currency, // The native currency of this asset (e.g., "USD", "EUR", "BTC")
        BigDecimal initialValue, // The current value in its native currency
        BigDecimal quantity,
        BigDecimal balance,
        String institution,
        String description,
        Map<String, Object> customFields) {
}
