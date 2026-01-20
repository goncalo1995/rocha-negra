package com.rochanegra.api.finance.transactions;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import com.rochanegra.api.finance.types.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// DTO for creating a new transaction
public record TransactionCreateDto(
                @NotNull BigDecimal amountOriginal, // The amount in the original currency
                @NotBlank String currencyOriginal, // The currency of the transaction (e.g., "USD")
                @NotBlank String description,
                @NotNull LocalDate date,
                @NotNull TransactionType type,
                UUID categoryId,
                UUID assetId,
                UUID destinationAssetId,
                String attachmentUrl,
                Map<String, Object> customFields) {
}