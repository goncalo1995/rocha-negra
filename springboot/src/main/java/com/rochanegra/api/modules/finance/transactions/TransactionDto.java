package com.rochanegra.api.modules.finance.transactions;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import com.rochanegra.api.modules.finance.types.TransactionType;

// DTO for returning a transaction
public record TransactionDto(
        UUID id,
        UUID generatorId,
        BigDecimal amountOriginal,
        String currencyOriginal,
        BigDecimal amountBase,
        BigDecimal exchangeRate,
        String description,
        LocalDate date,
        TransactionType type,
        UUID categoryId,
        UUID assetId,
        UUID destinationAssetId,
        String attachmentUrl,
        Map<String, Object> customFields,
        Instant createdAt,
        Instant updatedAt) {
}