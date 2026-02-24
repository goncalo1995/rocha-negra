package com.rochanegra.api.modules.finance.recurring.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.rochanegra.api.modules.finance.types.TransactionType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TemplateCreateDto(
                @NotNull BigDecimal amount,
                @NotBlank String currency,
                @NotNull TransactionType type,
                @NotNull LocalDate effectiveFromDate,
                UUID categoryId,
                UUID assetId) {
}