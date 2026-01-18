package com.rochanegra.api.finance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.rochanegra.api.finance.types.TransactionType;

// DTO for creating a new transaction
public record TransactionCreateDto(
        BigDecimal amount,
        String description,
        LocalDate date,
        TransactionType type,
        UUID categoryId,
        UUID assetId) {
}