package com.rochanegra.api.finance.assets;

import com.rochanegra.api.finance.types.AssetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;

public record AssetCreateDto(
        @NotBlank String name,
        @NotNull AssetType type,
        @NotNull BigDecimal currentValue,
        String institution,
        String description,
        Map<String, Object> customFields) {
}
