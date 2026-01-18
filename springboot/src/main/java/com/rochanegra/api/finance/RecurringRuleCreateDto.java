package com.rochanegra.api.finance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record RecurringRuleCreateDto(
        String description,
        BigDecimal projectedAmount,
        RecurringFrequency frequency,
        LocalDate nextDueDate,
        UUID categoryId,
        UUID assetId) {
}