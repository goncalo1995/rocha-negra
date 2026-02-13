package com.rochanegra.api.dashboard.dtos;

import java.math.BigDecimal;

public record ItWidgetDto(
        int totalDomains,
        BigDecimal annualCost) {
}
