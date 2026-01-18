package com.rochanegra.api.finance.transactions;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.rochanegra.api.finance.types.TransactionType;

// DTO for returning a transaction
public record TransactionDto(
                UUID id,
                BigDecimal amount,
                String description,
                LocalDate date,
                TransactionType type,
                UUID categoryId,
                UUID assetId,
                Instant createdAt) {
}