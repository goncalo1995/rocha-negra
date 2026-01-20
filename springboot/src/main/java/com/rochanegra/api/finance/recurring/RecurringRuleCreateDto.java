package com.rochanegra.api.finance.recurring;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.rochanegra.api.finance.types.TransactionType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RecurringRuleCreateDto(
        @NotBlank String description,
        @NotNull RecurringFrequency frequency,
        @NotNull LocalDate startDate,
        LocalDate endDate,

        // Fields for the initial TransactionTemplate
        @NotNull BigDecimal amount,
        @NotBlank String currency,
        @NotNull TransactionType type,
        UUID categoryId,
        UUID destinationAssetId,
        UUID assetId) {
}