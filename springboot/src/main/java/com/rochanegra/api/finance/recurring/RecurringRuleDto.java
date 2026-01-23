package com.rochanegra.api.finance.recurring;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.rochanegra.api.finance.types.TransactionType;

public record RecurringRuleDto(
                UUID id,
                String description,
                BigDecimal amount,
                String currency,
                TransactionType type,
                RecurringFrequency frequency,
                LocalDate nextDueDate,
                LocalDate endDate,
                boolean isActive,
                UUID categoryId,
                UUID assetId) {
}