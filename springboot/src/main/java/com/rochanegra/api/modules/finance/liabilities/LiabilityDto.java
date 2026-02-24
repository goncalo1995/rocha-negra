package com.rochanegra.api.modules.finance.liabilities;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import com.rochanegra.api.modules.finance.types.LiabilityType;

import java.time.Instant;

public record LiabilityDto(
                UUID id,
                String name,
                LiabilityType type,
                String currency,
                BigDecimal initialAmount,
                BigDecimal currentBalance,
                BigDecimal interestRate,
                String description,
                Map<String, Object> customFields,
                Instant createdAt,
                Instant updatedAt) {
}
