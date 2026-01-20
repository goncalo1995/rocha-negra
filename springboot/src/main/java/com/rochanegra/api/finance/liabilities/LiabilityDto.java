package com.rochanegra.api.finance.liabilities;

import com.rochanegra.api.finance.types.LiabilityType;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
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
