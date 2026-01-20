package com.rochanegra.api.finance.transactions;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransactionUpdateDto(
        // All fields are optional. The user only sends what they want to change.
        BigDecimal amountOriginal,
        String currencyOriginal,
        String description,
        LocalDate date,
        UUID categoryId,
        UUID assetId,
        UUID destinationAssetId
// We don't allow changing the 'type' directly; it's derived.
) {
}