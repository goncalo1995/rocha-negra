package com.rochanegra.api.modules.dashboard.dtos;

import java.math.BigDecimal;

public record DebtsWidgetDto(
                int totalDebts,
                BigDecimal totalOutstanding) {
}
