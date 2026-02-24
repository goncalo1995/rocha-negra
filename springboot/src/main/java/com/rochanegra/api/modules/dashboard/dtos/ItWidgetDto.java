package com.rochanegra.api.modules.dashboard.dtos;

import java.math.BigDecimal;

public record ItWidgetDto(
                int totalDomains,
                BigDecimal annualCost) {
}
