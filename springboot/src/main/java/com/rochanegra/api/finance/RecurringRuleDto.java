package com.rochanegra.api.finance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record RecurringRuleDto(
        UUID id,
        String description,
        BigDecimal projectedAmount,
        RecurringFrequency frequency,
        LocalDate nextDueDate,
        boolean isActive,
        UUID categoryId,
        UUID assetId) {
}