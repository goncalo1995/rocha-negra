package com.rochanegra.api.finance.recurring;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record RecurringRuleCreateDto(
                @NotBlank String description,
                @NotNull @PositiveOrZero BigDecimal projectedAmount,
                @NotNull RecurringFrequency frequency,
                @NotNull LocalDate nextDueDate,
                UUID categoryId,
                UUID assetId) {
}