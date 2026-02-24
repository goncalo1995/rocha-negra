package com.rochanegra.api.modules.domains;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.rochanegra.api.modules.domains.dto.PriceHistoryDto;

public record DomainDto(
                UUID id,
                String name,
                String registrar,
                LocalDate registrationDate,
                LocalDate expirationDate,
                String status,
                boolean autoRenew,
                String notes,
                BigDecimal currentPrice, // The most recent price
                String currency,
                List<PriceHistoryDto> priceHistory) {
}