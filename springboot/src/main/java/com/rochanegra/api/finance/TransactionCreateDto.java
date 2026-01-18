package com.rochanegra.api.finance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.rochanegra.api.finance.types.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

// DTO for creating a new transaction
public record TransactionCreateDto(
                @NotNull @PositiveOrZero BigDecimal amount,
                @NotBlank String description,
                @NotNull LocalDate date,
                @NotNull TransactionType type,
                UUID categoryId,
                UUID assetId) {
}