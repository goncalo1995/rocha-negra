package com.rochanegra.api.it_assets.domains.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PriceHistoryDto(
                BigDecimal price,
                String currency,
                LocalDate effectiveDate) {
}
