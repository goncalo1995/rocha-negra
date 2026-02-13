package com.rochanegra.api.dashboard.dtos;

import java.math.BigDecimal;

public record DebtsWidgetDto(
        int totalDebts,
        BigDecimal totalOutstanding) {
}