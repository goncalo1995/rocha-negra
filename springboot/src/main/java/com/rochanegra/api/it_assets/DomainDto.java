package com.rochanegra.api.it_assets;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record DomainDto(
        UUID id,
        String name,
        String registrar,
        LocalDate expirationDate,
        // ... all other domain fields
        BigDecimal currentPrice,
        String currency,
        List<PriceHistoryDto> priceHistory) {
}