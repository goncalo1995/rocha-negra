package com.rochanegra.api.finance.liabilities;

import java.math.BigDecimal;
import java.util.Map;

import jakarta.validation.constraints.NotBlank;

public record LiabilityUpdateDto(
        // Use @NotBlank for strings if you want to prevent them from being set to
        // empty.

        @NotBlank String name,
        BigDecimal interestRate,
        String description,
        Map<String, Object> customFields) {
}
