package com.rochanegra.api.modules.finance.liabilities;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

import com.rochanegra.api.modules.finance.types.LiabilityType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LiabilityCreateDto(
                @NotBlank String name,
                @NotNull LiabilityType type,
                @NotBlank String currency,
                @NotNull BigDecimal initialAmount,
                @NotNull BigDecimal currentBalance,
                @NotNull BigDecimal interestRate,
                String description,
                Map<String, Object> customFields,
                Instant createdAt,
                Instant updatedAt) {
}
