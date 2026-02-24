package com.rochanegra.api.modules.domains.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PriceHistoryDto(
        BigDecimal price,
        String currency,
        LocalDate effectiveDate) {
}
