package com.rochanegra.api.it_assets.domains;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.rochanegra.api.it_assets.domains.dto.PriceHistoryDto;

public record DomainDto(
        UUID id,
        UUID recurringGeneratorId,
        String name,
        String registrar,
        LocalDate registrationDate,
        LocalDate expirationDate,
        boolean autoRenew,
        String notes,
        BigDecimal currentPrice, // The most recent price
        String currency,
        List<PriceHistoryDto> priceHistory) {
}